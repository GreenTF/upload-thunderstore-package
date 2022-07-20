# upload-thunderstore-package
Github action that uses the thunderstore CLI to upload a package to thunderstore

## Usage 

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
      - uses: GreenTF/upload-thunerstore-package@v1
        with:
          namespace: GreenTF # the thunderstore 'team' to publish under
          description: Test 
          token: your-token
          name: test # the name of the package
          version: $GITHUB_REF # Use the tag of the release as the package version
          community: Northstar
```
