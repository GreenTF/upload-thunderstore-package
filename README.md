# upload-thunderstore-package
Github action that uses the thunderstore CLI to upload a package to thunderstore

## Usage 

```yml
name: 

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
      - uses: GreenTF/upload-thunerstore-package@v0
        with:
          namespace: GreenTF
          description: Test
          token: your-token
          name: test
          version: $GITHUB_REF # Use the tag of the release as the package version
          community: Northstar
```
