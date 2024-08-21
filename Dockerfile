FROM ghcr.io/greentf/tcli:bun
COPY ./entrypoint.sh /entrypoint.sh
COPY ./index.ts /index.ts
COPY ./package.json /package.json
COPY ./bun.lockb /bun.lockb
RUN ["bun", "install", "--frozen-lockfile"]
RUN ["chmod", "+x", "/entrypoint.sh"]
ENTRYPOINT ["/entrypoint.sh"]
