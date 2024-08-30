import os
import io
from urllib.request import urlopen
import hashlib
import zipfile

root = os.environ.get("GITHUB_ACTION_PATH") or "./"
remote_root = os.path.join(root, "remote")

url = os.environ.get("OUTPUT_URL")

if not url or len(url) == 0:
    print("Output URL was empty!")
    exit(1)

paths = {
    "remote": {
        "readme": os.path.join(root, "remote", "README.md"),
        "lockfile": os.path.join(root, "remote", "mods", "bun.lockb")
    },
    "local": {
        "readme": os.path.join(root, "README.md"),
        "lockfile": os.path.join(root, "bun.lockb")
    }
}

print(f"Downloading the published archive from {url}")
archive = urlopen(url)
print("Extracting README.md and mods/bun.lockb")

file = zipfile.ZipFile(io.BytesIO(archive.read()))
file.extract("README.md", remote_root)
file.extract("mods/bun.lockb", remote_root)

print("Hashing files")

# remote hashing
r_hasher = hashlib.new('sha256')
r_hasher.update(open(paths["remote"]["readme"], mode='rb').read())
r_hasher.update(open(paths["remote"]["lockfile"], mode='rb').read())
remote_hash = r_hasher.hexdigest()

# local hashing
l_hasher = hashlib.new('sha256')
l_hasher.update(open(paths["local"]["readme"], mode='rb').read())
l_hasher.update(open(paths["local"]["lockfile"], mode='rb').read())
local_hash = l_hasher.hexdigest()

print(f"::debug::Remote hash: {remote_hash} | Local hash: {local_hash}")

if remote_hash == local_hash:
    print("Remote package was verified!")
else:
    print("::error::Hashes didn't match!")
    print(f"::error::Remote hash: {remote_hash} | Local hash: {local_hash}")
    exit(1)



