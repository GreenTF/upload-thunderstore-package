const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const tc = require('@actions/tool-cache');
const fs = require('fs');
const {exec} = require('child_process');
const http = require('http');

const download_ext = {
  "linux":"linux-x64.tar.gz",
  "macos":"osx-x64.tar.gx",
  "windows":"win-x64.zip"
};

const platform = process.env.RUNNER_OS.toLowerCase();

// Set up CLI
// May be moved to a separate action in the future idk
async function setup() {
  try {
    exec("ls -la", (err, stdout, stderr) => console.log(stdout));
    core.startGroup("Set up tcli");
    const download_url = `https://github.com/thunderstore-io/thunderstore-cli/releases/download/0.1.4/tcli-0.1.4-${download_ext[platform]}`;
    core.info(`Downloading from ${download_url}`);
    const download = await tc.downloadTool(download_url);
    
    const extract = download_url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
    const extracted_path = await extract(download, './');
    
    //TODO: Add tool caching
    core.addPath(path.join(extracted_path, `tcli${platform === "windows" ? ".exe" : ""}`));
    core.endGroup();
  }catch(e) {
    core.setFailed(e);
  }
  
}


async function main() {
  // Set up environment
  core.startGroup("Set up environment");
  let p = core.toPlatformPath(core.getInput('path'));
  if (!p) {
    p = ".";
    core.info("Path input not set");
  }

  const wrap = core.getInput('wrap');
  const target = core.toPlatformPath(path.join('./dist', wrap ? wrap : ''));

  //Create the dist directory
  fs.mkdir(target, {recursive: true});

  //Check for the README.md
  if  (fs.existsSync(path.join(p, "README.md"))){
    core.info(`Using README in ${p}`);
    fs.renameSync(path.join(p, "README.md"), core.toPlatformPath(path.join("/", "README.md")));
  }else if (core.getInput("readme") !== "") {
    const url = core.getInput("readme");
    core.info(`Attempting to download README from ${url}`);
    donwloadFile(url, "/README.md");
  }


  //Check for the icon
  if (fs.existsSync(path.join(p, "icon.png"))){
    core.info(`Using icon in ${p}`);
    fs.renameSync(path.join(p, "icon.png"), core.toPlatformPath(path.join("/", "icon.png")));
  }else if (core.getInput("icon") !== "") {
    const url = core.getInput("icon");
    core.info(`Attempting to download icon from ${url}`);
    donwloadFile(url, "/icon.png");
  }
  fs.renameSync(p, target);

  core.endGroup();

  core.startGroup("Configre cli");
  process.chdir("/");

  const name = core.getInput('name', {required = true});
  const namespace = core.getInput('namespace', {required = true});
  const version = core.getInput('version', {required = true});

  exec(`tcli init --package-name=${name} --package-namespace=${namespace} --package-version=${version}`, (err, stdout, stderr) => {
    if (err) {
      core.error("Error calling the Thunderstore CLI");
      core.error(err);
      core.setFailed();
    }

    if (stderr) {
      core.error("Error from tcli");
      core.error(stderr);
      core.setFailed();
    }

    core.info(stdout);

  });



  
  
}

async function donwloadFile(url, name) {
  const file = fs.createWriteStream(name);
  http.get(url, (resp) => {
    resp.pipe(file);

    file.on("finish", () => {
      file.close();
    });

    file.on("error", (e) => {
      core.debug(e);
      core.setFailed(`Error when writing file ${name}`);
    });
  });
}

if (require.main === module) {
  //Idk if github actions have top level await or not
  setup().then(main);
}
