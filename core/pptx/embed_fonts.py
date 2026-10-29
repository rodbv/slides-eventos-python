"""Turn on font embedding in an .odp and let LibreOffice re-save it.

LibreOffice embeds the fonts a document uses only when the document's own
settings ask for it, so the settings are switched on first and the file is
then saved again through `soffice`.

    python core/pptx/embed_fonts.py dist/pybr2026-template.odp
"""

import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

EMBED_SETTINGS = {
    "EmbedFonts": "true",
    "EmbedOnlyUsedFonts": "true",
    "EmbedLatinScriptFonts": "true",
    "EmbedAsianScriptFonts": "false",
    "EmbedComplexScriptFonts": "false",
}


def with_embed_settings(settings_xml: str) -> str:
    for name, value in EMBED_SETTINGS.items():
        item = f'<config:config-item config:name="{name}" config:type="boolean">'
        pattern = re.escape(item) + r"(true|false)</config:config-item>"
        if re.search(pattern, settings_xml):
            settings_xml = re.sub(pattern, f"{item}{value}</config:config-item>", settings_xml)
        else:
            anchor = '<config:config-item config:name="PrinterName"'
            settings_xml = settings_xml.replace(anchor, f"{item}{value}</config:config-item>{anchor}", 1)
    return settings_xml


def rewrite_settings(src: Path, dst: Path) -> None:
    with zipfile.ZipFile(src) as zin, zipfile.ZipFile(dst, "w") as zout:
        # ODF requires the mimetype entry first and uncompressed.
        zout.writestr(zin.getinfo("mimetype"), zin.read("mimetype"), compress_type=zipfile.ZIP_STORED)
        for info in zin.infolist():
            if info.filename == "mimetype":
                continue
            data = zin.read(info.filename)
            if info.filename == "settings.xml":
                data = with_embed_settings(data.decode("utf-8")).encode("utf-8")
            zout.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED)


def main(odp: Path) -> None:
    # The LibreOffice flatpak cannot read /tmp, so the work folder sits next to the file.
    with tempfile.TemporaryDirectory(dir=odp.parent) as work:
        work_dir = Path(work)
        staged = work_dir / odp.name
        rewrite_settings(odp, staged)
        out_dir = work_dir / "out"
        subprocess.run(
            ["soffice", "--headless", "--convert-to", "odp", "--outdir", str(out_dir), str(staged)],
            check=True,
            capture_output=True,
        )
        shutil.copyfile(out_dir / odp.name, odp)
    with zipfile.ZipFile(odp) as z:
        fonts = sorted(n for n in z.namelist() if n.startswith("Fonts/"))
    print(f"{odp}: {len(fonts)} embedded font files")
    for name in fonts:
        print("  " + name)


if __name__ == "__main__":
    main(Path(sys.argv[1]).resolve())
