# upload-thunderstore-package
Github action that uses the thunderstore CLI to upload a package to thunderstore

## Usage 

```yml
name: 

# Controls when the workflow will run
on:
  push:
    branches:
      - 'releases/**' # run when a new release is created

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  publish:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
      - uses: actions/checkout@v3
      - uses: GreenTF/upload-thunerstore-package@v0
        with:
          namespace: GreenTF
          description: Test
          token: your-token
          name: test
          version: 0.1.0
          community: Northstar
```
