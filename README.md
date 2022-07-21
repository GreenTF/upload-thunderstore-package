# upload-thunderstore-package
Github action that uses the thunderstore CLI to upload a package to thunderstore

## Usage 
<h3 align="center"> 
  <img src="https://thumbs.gfycat.com/UniqueSizzlingFinwhale-max-1mb.gif" alt="warning sign" width="10%" />
  <br>
  !!!IMPORTANT!!!<br>DON'T PUT YOUR TOKEN IN THE WORKFLOW FILE. DOING SO WILL ALLOW ANYONE TO UPLOAD ANY MODS UNDER YOUR NAME! 
 </h3> 

<p align="center">⚠️ Add it to your repo secrets and access it in the workflow with `${{ secrets.YOUR_TOKEN_NAME }}` ⚠️</p>

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
      - uses: GreenTF/upload-thunerstore-package@v0.4
        with:
          namespace: GreenTF # the thunderstore 'team' to publish under
          description: Test 
          token: ${{ secrets.your-token }}
          name: test # the name of the package
          version: $GITHUB_REF # Use the tag of the release as the package version
          community: Northstar
```

## Inputs
| Input | Description | Required |
|-------|-------------|----------|
| `token` | Service account token from Thunderstore. | `true` |
| `community` | Thunderstore community to publish to. | `true` |
| `namespace` | Name of the team to publish under. | `true` |
| `name` | Name of the package. | `true` |
| `description` | Description of the package that will appear on Thunderstore. | `true` |
| `version` | Package version in SemVer format. | `true` |
| `path` | Path of the files to package. Useful when using build artifacts from other steps. Defaults to using the contents of the repo. | `false` |
| `icon` | URL to download the icon from. Will try to find `icon.png` in the root of the repo if not provided. | `false` |
| `readme` | URL to download the readme from. Will try to fine `README.md` in the root of the repo if not provided. | `false` |
| `dev` | Publish to https://thunderstore.dev if set, https://thunderstore.io if not set. | `false` |


