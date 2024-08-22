import TOML from "smol-toml";
import fs from "node:fs/promises";
import p from "node:path";

const namespace = Bun.env.TS_NAMESPACE;
const name = Bun.env.TS_NAME;
const version = (Bun.env.TS_VERSION ?? "0.0.0").replace(/v/g, "");
const desc = (Bun.env.TS_DESC ?? "").substring(0, 256); //truncate overlong descriptions
const homepage = Bun.env.TS_WEBSITE;
const categories = (Bun.env.TS_CATEGORIES ?? "").replace(/\s/g, ","); //support comma and new-line delimiters
const deps = (Bun.env.TS_DEPS ?? "").replace(/\n/g, " ");
const community = Bun.env.TS_COMMUNITY;
const nsfw = Bun.env.TS_NSFW;
const wrap = Bun.env.TS_WRAP;
const repo = Bun.env.TS_REPO ?? "https://thunderstore.io";
const target_repo = Bun.env.TS_DEV?.toLowerCase() === "true" ? "https://thunderstore.dev" : repo;

const moveDirContents = async (from: string, to: string) => {
  const files = await fs.readdir(from);
  for(const file of files) {
    Bun.spawnSync(["mv", p.join(from, file), p.join(to, file)]);
  }
}

const publish = async (target: string, file: string | undefined) => {
  console.log("::group::Publish package");
  const args = file ? ["--file", p.join("/dist", file)] : [];
  const pub = Bun.spawnSync(["tcli", "publish", "--repository", target, ...args], {
    env: {...Bun.env}
  });
  const out = pub.stdout.toString();

  console.log(out);
  if (pub.exitCode !== 0 || out.toLowerCase().includes("error")) {
    console.log("::error::Tcli encountered an error while publishing");
    console.log(`::error::${pub.stderr}`);
  }

  const url = out.match(/https.*/g)?.[0];

  if (url && Bun.env.GITHUB_OUTPUT) {
    Bun.write(Bun.env.GITHUB_OUTPUT, `url=${url}`);
  } else {
    console.log("::error::Unable to write url to output")
    console.log(url)
  }

  console.log("Done!");
  console.log("::endgroup::");
}

// This doesn't work because the thunderstore.toml needs to be created
// maybe this should just be a requirement of having a prebuilt file?
// // Skip everything if a prebuilt file is provided
// if(Bun.env.TS_FILE) {
//   console.log("Publishing prebuild file");

//   await publish(target_repo, Bun.env.TS_FILE);
//   process.exit(0);
// }


// Move files to where they're expected
console.log("::group::Set up environment");
const path = Bun.env.TS_PATH ? p.normalize(Bun.env.TS_PATH) : process.cwd();
console.log("Moving files from", path, "to /dist");

// Create the dist dir
await fs.mkdir("/dist");
await moveDirContents(path, "/dist");

Bun.spawnSync(["mv", path, "/dist"]);
await Bun.spawn(["ls", "/dist"]).exited;

// The readme and icon need to be in the root though

if (!Bun.env.TS_README && await Bun.file("/dist/README.md").exists()) {
  Bun.spawnSync(["mv", "/dist/README.md", "/README.md"]);
} else if (Bun.env.TS_README) {
  const readme = await fetch(Bun.env.TS_README);
  await Bun.write("/README.md", readme);
} else {
  console.log("::error::README.md doesn't exist and the readme input is unset");
}

if (!Bun.env.TS_ICON && await Bun.file("/dist/icon.png").exists()) {
  Bun.spawnSync(["mv", "/dist/icon.png", "/icon.png"]);
} else if (Bun.env.TS_ICON) {
  const icon = await fetch(Bun.env.TS_ICON);
  await Bun.write("/icon.png", icon);
} else {
  console.log("::error::icon.png doesn't exist and the icon input is unset");
}

console.log("::endgroup::");

// Configure tcli and build the pacakge if needed

console.log("::group::Configure tcli");
process.chdir("/");

console.log("Init tcli config");
const config = Bun.spawnSync(["tcli", "init", "--package-name", name ?? "", "--package-namespace", namespace ?? "", "--package-version", version], {
  env: {...Bun.env},
});
console.log(config.stdout.toString());
if (config.exitCode !== 0) {
  console.log("::error::Failed to init tcli");
  console.log(`::error::${config.stderr.toString()}`);
  process.exit(1);
}

// Bun-ified cfg_edit.js

// Read in thunderstore.toml
// Bun actually supports importing TOML natively but can't currently write it
const tstore = TOML.parse(await Bun.file("./thunderstore.toml").text());

const re = /([a-zA-Z_0-9]*-[a-zA-Z_0-9]*)[\-@](\d+\.\d+\.\d+)/;

//these should be set already but we're rewriting the whole file anyways
tstore.package = {
  namespace: namespace ?? "",
  name: name ?? "",
  versionNumber: version,
  description: desc,
  dependencies: {}
};

tstore.publish = {}
if (community)
  tstore.publish.communities = [community];

tstore.build = {
  copy: [{
    target: wrap ?? ""
  }]
};

tstore.publish.repository = repo ?? "https://thunderstore.io";

//check for optional inputs
if (homepage && homepage !== "") {
  tstore.package.websiteUrl = homepage;
} else {
  tstore.package.websiteUrl = `${Bun.env.GITHUB_SERVER_URL}/${Bun.env.GITHUB_REPOSITORY}`;
}

if (nsfw && nsfw === "true") {
  tstore.package.containsNsfwContent = true;
}

if (categories && categories !== "") {
  console.log(`::debug::Parsing categories: ${categories}`);
  tstore.publish.categories = {};
  tstore.publish.categories[community ?? ""] = categories
    .split(",")
    .filter((e) => e) //only keep truthy elements
    .map((e) => e.toLowerCase().trim());
}

if (deps && deps !== "") {
  console.log("::debug::Parsing dependencies: ", deps.split(" "));
  const p: Record<string, string> = {};
  for (let d of deps.split(" ")) {
    if (!d) {
      console.log("::warn::Empty dependency", d);
      continue;
    }

    const parts = d.match(re);
    if (parts) {
      console.log("::debug::Parts:", parts);
      p[parts[1]] = parts[2];
    } else {
      console.log("::error::Malformed dependency at ", d);
      process.exit(1);
    }
  }

  console.log("::debug:: Built depencendies:", p);
  tstore.package.dependencies = p;
}

//write config file back to disk
await Bun.write("./thunderstore.toml", TOML.stringify(tstore));

console.log("Done config edit");
console.log(`\n${TOML.stringify(tstore)}`);
console.log("::endgroup::");

// Build and publish package
await publish(target_repo, Bun.env.TS_FILE);

