const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const tc = require('@actions/tool-cache');

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

    const download_url = `https://github.com/thunderstore-io/thunderstore-cli/releases/download/0.1.4/tcli-0.1.4-${download_ext[platform]}`;
    core.info(`Downloading from ${download_url}`);
    const download = await tc.downloadTool(download_url);
    
    const extract = download_url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
    const extracted_path = await extract(download, '/bin');
    
    //TODO: Add tool caching
    core.addPath(path.join(extracted_path, `tcli${platform === "windows" ? ".exe" : ""}`));
    
  }catch(e) {
    core.setFailed(e);
  }
  
}


async function main() {
  // Set up environment
  core.startGroup("Set up environment");
  let p = core.getInput('path');
  if (!p) {
    p = ".";
    core.info("Path input not set");
  }
  
  
}

if (require.main === module) {
  setup();
  main();
}
