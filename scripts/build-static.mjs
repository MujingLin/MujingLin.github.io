import { execFile } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, stat, unlink, writeFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";
import { promisify } from "node:util";

await import("./validate-content.mjs");

const run = promisify(execFile);

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const client = resolve(dist, "client");

const entries = [
  "index.html",
  "profile",
  "work",
  "compass",
  "assets",
  "backgroundimage",
  "content",
  "images",
];

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "server"), { recursive: true });
await mkdir(client, { recursive: true });

for (const entry of entries) {
  await cp(resolve(root, entry), resolve(client, entry), { recursive: true });
}

await mkdir(resolve(client, "file"), { recursive: true });
await cp(resolve(root, "file/CV.pdf"), resolve(client, "file/CV.pdf"));

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walk(path));
    else output.push(path);
  }
  return output;
}

const replacements = new Map();
for (const path of await walk(client)) {
  if (!/[.](png|jpe?g|webp)$/i.test(path) || (await stat(path)).size < 600_000) continue;
  const optimized = `${path}.preview.jpg`;
  const maximumDimension = path.includes("backgroundimage") ? "1920" : "1600";
  await run("/usr/bin/sips", ["-Z", maximumDimension, "-s", "format", "jpeg", "-s", "formatOptions", "82", path, "--out", optimized]);
  const oldRelative = relative(client, path).split("\\").join("/");
  const newRelative = relative(client, optimized).split("\\").join("/");
  replacements.set(oldRelative, newRelative);
  await unlink(path);
}

for (const path of await walk(client)) {
  if (!/[.](html|css|js|md|txt)$/i.test(path)) continue;
  let text = await readFile(path, "utf8");
  for (const [from, to] of replacements) text = text.split(from).join(to);
  await writeFile(path, text);
}

await writeFile(
  resolve(dist, "server/index.js"),
  `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);
    if (response.status === 404 && !url.pathname.split("/").pop().includes(".")) {
      const pathname = url.pathname.endsWith("/") ? url.pathname + "index.html" : url.pathname + "/index.html";
      response = await env.ASSETS.fetch(new Request(new URL(pathname, url), request));
    }
    return response;
  }
};\n`,
);
