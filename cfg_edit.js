import * as TOML from "npm:@aduh95/toml@0.4.2";

//Read in thunderstore.toml
const tstore = TOML.parse(await Deno.readTextFile("./thunderstore.toml"));

const namespace = Deno.env.get("TS_NAMESPACE");
const name = Deno.env.get("TS_NAME");
const version = Deno.env.get("TS_VERSION").replace(/v/g, '');
const desc = Deno.env.get("TS_DESC");
const homepage = Deno.env.get("TS_WEBSITE");
const categories = Deno.env.get("TS_CATEGORIES").replace(/\n/g, ','); //support comma and new-line delimiters
const deps = Deno.env.get("TS_DEPS").replace(/\n/g, ' ');
const community = Deno.env.get("TS_COMMUNITY");
const nsfw = Deno.env.get("TS_NSFW");
const wrap = Deno.env.get("TS_WRAP");


//these should be set already but we're rewriting the whole file anyways
tstore.package.namespace = namespace;
tstore.package.name = name;
tstore.package.versionNumber = version;
tstore.package.description = desc;

tstore.publish.communities = [community];
tstore.build.copy[0].target = wrap;
tstore.package.dependencies = {};


//check for optional inputs
if (homepage && homepage !== "") {
  tstore.package.websiteUrl = homepage;
} else {
  tstore.package.websiteUrl = `${Deno.env.get("GITHUB_SERVER_URL")}/${Deno.env.get("GITHUB_REPOSITORY")}`;
}

if (nsfw && nsfw === "true" ) {
  tstore.package.containsNsfwContent = true
}

if (categories && categories !== "") {
  console.log(`::debug::Parsing categories: ${categories}`);
  tstore.publish.categories = categories.split(',')
    .filter(e => e) //only keep truthy elements
    .map(e=> e.toLowerCase());
}

if (deps && deps !== "") {
  const p = {};
  for (let d of deps.split(' ')) {
    if(!d)
      continue;
    if (!d.includes('@')) {
      console.log("Malformed dependency at ", d);
      Deno.exit(-1);
    }
    
    const parts = d.split('@');
    p[parts[0]] = parts[1];
  }
  
  console.log(p);
  tstore.package.dependencies = p;
}


//write config file back to disk
Deno.writeTextFile("./thunderstore.toml", TOML.stringify(tstore));
