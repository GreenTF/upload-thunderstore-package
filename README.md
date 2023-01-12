# upload-thunderstore-package
Github action that uses the thunderstore CLI to upload a package to thunderstore

## Usage 
<h3 align="center"> 
  <img src="https://thumbs.gfycat.com/UniqueSizzlingFinwhale-max-1mb.gif" alt="warning sign" width="10%" />
  <br>
  !!!IMPORTANT!!!<br>DON'T PUT YOUR TOKEN IN THE WORKFLOW FILE. DOING SO WILL ALLOW ANYONE TO UPLOAD ANY MODS UNDER YOUR NAME! 
 </h3> 

<p align="center">⚠️ Add it to your repo secrets and access it in the workflow with <code>${{ secrets.YOUR_TOKEN_NAME }}</code> ⚠️</p>

```yml
name: Publish Mod

# Run when a new release is... released
on: 
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      # Use checkout to publish the files in your repo
      - uses: actions/checkout@v3
      - uses: GreenTF/upload-thunderstore-package@v2.2
        with:
          namespace: GreenTF # the thunderstore 'team' to publish under
          description: Test 
          token: ${{ secrets.YOUR_TOKEN_NAME }}
          name: test # the name of the package
          version: $GITHUB_REF_NAME # Use the tag as the package version
          community: Northstar
```

## Getting a Thunderstore token

Check the wiki [here](https://github.com/GreenTF/upload-thunderstore-package/wiki#where-to-get-your-thunderstore-token)


## Inputs
| Input | Description | Required |
|-------|-------------|----------|
| `token` | Service account token from Thunderstore. Should be saved as a repo secret and accessed with `${{ secrets.YOUR_TOKEN_NAME }}` | `true` |
| `community` | Thunderstore community to publish to. | `true` |
| `namespace` | Name of the team to publish under. | `true` |
| `name` | Name of the package. | `true` |
| `description` | Description of the package that will appear on Thunderstore. | `true` |
| `version` | Package version in SemVer format. | `true` |
| `file` | Path to a prebuilt zip file. Will skip the build step if provided. | `false` |
| `path` | Path of the files to package. Useful when using build artifacts from other steps. Defaults to using the contents of the repo. | `false` |
| `icon` | URL to download the icon from. Will try to find `icon.png` in the root of the repo if not provided. | `false` |
| `readme` | URL to download the readme from. Will try to find `README.md` in the root of the repo if not provided. | `false` |
| `dev` | Publish to https://thunderstore.dev if set, https://thunderstore.io if not set. | `false` |
| `wrap` | Directory to wrap the contents of the repo in. By default the contents of the root of the repo will be in the root of the package. | `false` |
| `categories` | A list, separated by spaces of categories to give to the mod when published. These must be available in the community you're publishing to. | `false` |
| `deps` | A list, separated by spaces, of mods this mod depends on. Must be in `namespace-modname@1.2.3` format. The publish will fail if any of these aren't a real package. | `false` |
| `website` | The homepage URL for the mod. Defaults to the github repo URL. | `false`
| `nsfw` | Set this to mark the mod as NSFW | `false` | 

## Outputs
| Output | Description |
|--------|-------------|
| `url` | The download URL of the published package |

