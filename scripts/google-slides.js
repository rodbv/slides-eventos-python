// Replaces the content of each event's Google Slides copies with the .pptx files in dist/,
// so the /copy links in event.json keep their address and always give the current template.
// A Google service account signs in with the JSON key in GOOGLE_SERVICE_ACCOUNT_JSON; every
// Slides file needs that account as an editor.
//
//   GOOGLE_SERVICE_ACCOUNT_JSON="$(cat chave.json)" node scripts/google-slides.js [evento ...]
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const SLIDES = "application/vnd.google-apps.presentation";

async function accessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const encode = (part) => Buffer.from(JSON.stringify(part)).toString("base64url");
  const claims = { iss: key.client_email, scope: "https://www.googleapis.com/auth/drive", aud: key.token_uri, iat: now, exp: now + 600 };
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode(claims)}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), key.private_key).toString("base64url");
  const response = await fetch(key.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
  });
  if (!response.ok) throw new Error(`Google sign-in failed: ${response.status} ${await response.text()}`);
  return (await response.json()).access_token;
}

async function drive(token, url, options = {}) {
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${token}`, ...options.headers } });
  if (!response.ok) throw new Error(`${options.method || "GET"} ${url}: ${response.status} ${await response.text()}`);
  return response.json();
}

// Drive converts the .pptx into the Slides file in place: the file keeps its id, its sharing and its revision history.
async function replaceContent(token, fileId, pptxFile) {
  const fields = "fields=id,name,mimeType,modifiedTime";
  const before = await drive(token, `https://www.googleapis.com/drive/v3/files/${fileId}?${fields}&supportsAllDrives=true`);
  if (before.mimeType !== SLIDES) throw new Error(`${fileId} is ${before.mimeType}, not a Google Slides file`);
  const after = await drive(token, `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&${fields}&supportsAllDrives=true`, {
    method: "PATCH",
    headers: { "Content-Type": PPTX },
    body: fs.readFileSync(pptxFile),
  });
  if (after.mimeType !== SLIDES) throw new Error(`${fileId} became ${after.mimeType} after the upload`);
  return after;
}

const fileIdOf = (link) => link.match(/\/presentation\/d\/([\w-]+)/)[1];

(async () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  const token = await accessToken(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON));
  const slugs = process.argv.length > 2 ? process.argv.slice(2) : fs.readdirSync(path.join(ROOT, "events"));
  for (const slug of slugs) {
    const links = JSON.parse(fs.readFileSync(path.join(ROOT, "events", slug, "event.json"), "utf8")).googleSlides || {};
    for (const [version, link] of Object.entries(links)) {
      const pptxFile = path.join(ROOT, "dist", slug, `${slug}-${version}.pptx`);
      const file = await replaceContent(token, fileIdOf(link), pptxFile);
      console.log(`updated ${slug} ${version}: "${file.name}" (${file.id}) at ${file.modifiedTime}`);
    }
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
