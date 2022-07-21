#!/bin/bash

echo "::group::Set up environment"
# If the TS_PATH var is set and not empty
if [ -n "$TS_PATH" ]; then
  echo "::debug::TS_PATH found"
  p=$(echo $TS_PATH | sed 's:$/*::') #trim any trailing '/'
else
  echo "::debug::TS_PATH not set"
  p="."
fi

mkdir "/dist/"

# Move files to the dist directory for the tcli
echo "Move files from $p to /dist"
mv $p/* /dist/

# Move the README if it exists
if [ -e "/dist/README.md" ]; then
  echo "Move README"
  mv "/dist/README.md" "/"
elif [ -n "$TS_README" ]; then
  echo "Download README from $TS_README"
  wget -O "/README.md" "$TS_README"
fi

if [ -e "/dist/icon.png" ]; then
  echo "Move icon"
  mv "/dist/icon.png" "/"
elif [ -n "$TS_ICON" ]; then
  echo "Download icon from $TS_ICON"
  wget -O "/icon.png" "$TS_ICON"
fi

echo "::endgroup::"

cd "/"

echo "::group::Configure tcli"

#tcli usage based off of https://github.com/R2Northstar/Northstar/blob/d8ad8f12f8bca1e8de96f5d7163f71997d487218/.github/workflows/build.yml#L132-L192
echo "Init tcli config"
tcli init --package-name ${TS_NAME} --package-namespace ${TS_NAMESPACE} --package-version ${TS_VERSION}

if [ $? -ne 0 ]; then
  exit $?
fi

if  [ -n "$TS_DEV" ]; then
  repo="https://thunderstore.dev"
  TS_COMMUNITY="test"
else
  repo="https://thunderstore.io"
fi

echo "Set package community"
sed -i "s/communities = \[\]/communities = \[ \"$TS_COMMUNITY\" \]/g" thunderstore.toml
echo "Set package description"
sed -i "s/description = \"Example mod description\"/description = \"$TS_DESC\"/g" thunderstore.toml
echo "Remove example dependency" #TODO: Support dependencies
sed -i "s/Example-Dependency = \"1.0.0\"//g" thunderstore.toml

echo "Done config edit"
echo
echo "::debug::$(cat thunderstore.toml)"
echo "::endgroup::"

echo "::group::Build and publish"
tcli build

if [ $? -ne 0 ]; then
  exit $?
fi

echo "Publish to $repo"
out=$(tcli publish --repository ${repo} --file build/*.zip)
echo
echo $out
echo "::set-output name=url::$(grep "https:\/\/(?:\w*\.)?thunderstore\.(?:\w+)\/package\/download\/(?:\w+)\/(?:\w+)\/\d+\.\d+\.\d\/?" ${out})"

if [ $? -ne 0 ]; then
  exit $?
fi

echo "Done!"
echo "::endgroup::"

