#!/bin/bash

# If the TS_PATH var is set and not empty
if [ -n "$TS_PATH" ]; then
  echo "TS_PATH found"
  p=${TS_PATH}
else
  echo "TS_PATH not set"
  p="github/workspace"
fi

mkdir dist/

#Move the README if it exists
if [ -e "$p/README.md" ]; then
  mv "$p/README.md" "./"
fi

if [ -e "$p/icon.png" ]; then
  mv "$p/icon.png" "./"
fi
