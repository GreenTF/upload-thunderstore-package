#!/bin/bash

# If the TS_PATH var is set and not empty
if [ -n "$TS_PATH" ]; then
  echo "TS_PATH found"
  p=$(echo $TS_PATH | sed 's:$/*::') #trim any trailing '/'
else
  echo "TS_PATH not set"
  p="github/workspace"
fi

mkdir "dist/"

# Move the README if it exists
if [ -e "$p/README.md" ]; then
  echo "Move README"
  mv "$p/README.md" "./"
elif [ -n "$TS_README" ]; then
  wget -O "./readme" "$ST_README"
fi

if [ -e "$p/icon.png" ]; then
  echo "Move icon"
  mv "$p/icon.png" "./"
elif [ -n "$TS_ICON" ]; then
  wget -O "./icon.png" "$TS_ICON"
fi

# Move the remaining files to the dist directory for the tcli
echo "Move files"
mv $p/* dist/

#tcli usage based off of https://github.com/R2Northstar/Northstar/blob/d8ad8f12f8bca1e8de96f5d7163f71997d487218/.github/workflows/build.yml#L132-L192
echo "Init tcli config"
tcli init "--package-name=\"$TS_NAME\" --package-namespace=\"$TS_NAMESPACE\" --package-version=\"$TS_VERSION\""

echo "Set package community"
sed -i "s/communities = \[\]/communities = \[ \"$TS_COMMUNITY\" \]/g" thunderstore.toml
echo "Set package description"
sed -i "s/description = \"Example mod description\"/description = \"$TS_DESC\"/g" thunderstore.toml
echo "Remove example dependency"
sed -i "s/Example-Dependency = \"1.0.0\"//g" thunderstore.toml

echo "Done config edit"
cat thunderstore.toml

tcli build

if  [ -n "$TS_DEV" ]; then
  repo="thunderstore.dev"
else
  repo="thunderstore.io"
fi

output=$(tcli publish --repository "$repo" --file build/*.zip)
echo ${output}