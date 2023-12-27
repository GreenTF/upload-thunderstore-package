import * as TOML from "npm:@aduh95/toml@0.4.2";

//Read in thunderstore.toml
const tstore = TOML.parse(await Deno.readTextFile("./thunderstore.toml"));

const namespace = Deno.env.get("TS_NAMESPACE");
const name = Deno.env.get("TS_NAME");
const version = Deno.env.get("TS_VERSION").replace(/v/g, "");
const desc = Deno.env.get("TS_DESC").substring(0, 256); //truncate overlong descriptions
const homepage = Deno.env.get("TS_WEBSITE");
const categories = Deno.env.get("TS_CATEGORIES").replace(/\s/g, ","); //support comma and new-line delimiters
const deps = Deno.env.get("TS_DEPS").replace(/\n/g, " ");
const community = Deno.env.get("TS_COMMUNITY");
const nsfw = Deno.env.get("TS_NSFW");
const wrap = Deno.env.get("TS_WRAP");
const repo = Deno.env.get("TS_REPO");

const re = /([a-zA-Z_0-9]*-[a-zA-Z_0-9]*)[\-@](\d+\.\d+\.\d+)/;

//these should be set already but we're rewriting the whole file anyways
tstore.package.namespace = namespace;
tstore.package.name = name;
tstore.package.versionNumber = version;
tstore.package.description = desc;

tstore.publish.communities = [community];
tstore.build.copy[0].target = wrap;
tstore.package.dependencies = {};

tstore.publish.repository = repo ?? "https://thunderstore.io";

//check for optional inputs
if (homepage && homepage !== "") {
  tstore.package.websiteUrl = homepage;
} else {
  tstore.package.websiteUrl = `${Deno.env.get(
    "GITHUB_SERVER_URL"
  )}/${Deno.env.get("GITHUB_REPOSITORY")}`;
}

if (nsfw && nsfw === "true") {
  tstore.package.containsNsfwContent = true;
}

if (categories && categories !== "") {
  console.log(`::debug::Parsing categories: ${categories}`);
  tstore.publish.categories[community] = categories
    .split(",")
    .filter((e) => e) //only keep truthy elements
    .map((e) => e.toLowerCase().trim());
}

if (deps && deps !== "") {
  console.log("::debug::Parsing dependencies: ", deps.split(" "));
  const p = {};
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
      Deno.exit(1);
    }
  }

  console.log("::debug:: Built depencendies:", p);
  tstore.package.dependencies = p;
}

//write config file back to disk
Deno.writeTextFile("./thunderstore.toml", TOML.stringify(tstore));
