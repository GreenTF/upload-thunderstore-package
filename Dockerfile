FROM denoland/deno as setup
WORKDIR /
RUN ["apt", "update", "-yy"]
RUN ["apt", "install", "wget", "-yy"]
RUN ["wget", "-O", "tcli.tar.gz",  "https://github.com/thunderstore-io/thunderstore-cli/releases/download/0.2.1/tcli-0.2.1-linux-x64.tar.gz"]
RUN ["tar", "xvf", "tcli.tar.gz"]
RUN ["mv", "-v", "tcli-0.2.1-linux-x64/tcli", "/bin/tcli"]
COPY ./entrypoint.sh /entrypoint.sh
COPY ./cfg_edit.js /cfg_edit.js
RUN ["chmod", "+x", "/entrypoint.sh"]
RUN ["deno",  "cache", "/cfg_edit.js"]
ENTRYPOINT ["/entrypoint.sh"]
