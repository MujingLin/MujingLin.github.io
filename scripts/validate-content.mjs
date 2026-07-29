import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root=resolve(import.meta.dirname,"..");

async function read(relativePath){
  return readFile(resolve(root,relativePath),"utf8");
}

function withoutComments(text){
  return text.replace(/<!--[\s\S]*?-->/g,"");
}

function mediaEntries(text){
  return [...text.matchAll(/<!--\s*media:\s*track=(\d+)\s+chapter=([a-z-]+)\s*-->/gi)]
    .map(match=>({track:Number(match[1]),chapter:match[2]}));
}

function assert(condition,message){
  if(!condition)throw new Error(`Content validation: ${message}`);
}

const allowedChapters=new Set(["aigc","narrative","exhibition","reality","other"]);
const [worksEn,worksZh,profileEn,profileZh,compassEn,compassZh]=await Promise.all([
  read("content/works.en.md"),
  read("content/works.zh.md"),
  read("content/profile.en.md"),
  read("content/profile.zh.md"),
  read("content/compass.en.md"),
  read("content/compass.zh.md")
]);

const activeSourcePaths=[
  "index.html",
  "profile/index.html",
  "work/index.html",
  "compass/index.html",
  "assets/css/portfolio.css",
  "assets/js/portfolio-data.js",
  "assets/js/portfolio.js",
  "content/profile.en.md",
  "content/profile.zh.md",
  "content/works.en.md",
  "content/works.zh.md",
  "content/compass.en.md",
  "content/compass.zh.md"
];

function localAssetReferences(text){
  const source=withoutComments(text);
  const references=[
    ...source.matchAll(/(?:src|href)=["'](\/(?:assets|backgroundimage|content|images|file)\/[^"'?#]+)(?:[?#][^"']*)?["']/gi),
    ...source.matchAll(/url\(["']?(\/(?:assets|backgroundimage|content|images|file)\/[^)"']+)/gi),
    ...source.matchAll(/]\((\.?\/(?:images|file)\/[^)]+)\)/gi),
    ...source.matchAll(/["'](\/(?:assets|backgroundimage|content|images|file)\/[^"'?]+)(?:\?[^"']*)?["']/gi)
  ].map(match=>match[1].replace(/^\.?\//,""));
  return [...new Set(references)];
}

for(const sourcePath of activeSourcePaths){
  const source=await read(sourcePath);
  for(const assetPath of localAssetReferences(source)){
    try{await access(resolve(root,assetPath))}
    catch{assert(false,`${sourcePath} references a missing local file: ${assetPath}`)}
  }
}

const enEntries=mediaEntries(worksEn);
const zhEntries=mediaEntries(worksZh);
assert(enEntries.length>0,"Works must contain at least one media block.");
assert(JSON.stringify(enEntries)===JSON.stringify(zhEntries),"English and Chinese Works markers must match and stay in the same order.");
assert(new Set(enEntries.map(entry=>entry.track)).size===enEntries.length,"Works TRACK numbers must be unique.");
assert(enEntries.every(entry=>allowedChapters.has(entry.chapter)),"A Works block uses an unknown chapter ID.");

const youtubeIds=text=>[...text.matchAll(/^\[youtube:\s*([^\]\s]+)\s*\]$/gmi)].map(match=>match[1]);
assert(JSON.stringify(youtubeIds(worksEn))===JSON.stringify(youtubeIds(worksZh)),"English and Chinese Works YouTube IDs must match and stay in the same order.");
assert(!worksEn.includes("<iframe")&&!worksZh.includes("<iframe"),"Use [youtube:VIDEO_ID] instead of iframe code in Works.");

const compassHeadingCount=text=>(withoutComments(text).match(/^##\s+/gm)||[]).length;
assert(compassHeadingCount(compassEn)===compassHeadingCount(compassZh),"English and Chinese Compass cards must have matching counts.");

for(const [label,text] of [["English Profile",profileEn],["Chinese Profile",profileZh]]){
  assert(/^#\s+/m.test(text),`${label} needs a page title.`);
  assert(text.includes('class="profile-actions"'),`${label} needs the CV and contact action block.`);
  assert(text.includes('class="awards-reel"'),`${label} needs the awards block.`);
}

console.log(`Content validated: ${enEntries.length} Works entries, ${compassHeadingCount(compassEn)} Compass cards, and 2 Profile languages.`);
