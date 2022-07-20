FROM ubuntu as setup
WORKDIR /
RUN ["apt", "update", "-yy"]
RUN ["apt", "install", "wget", "-yy"]
RUN ["wget", "-O", "tcli.tar.gz",  "https://github.com/thunderstore-io/thunderstore-cli/releases/download/0.1.4/tcli-0.1.4-linux-x64.tar.gz"]
RUN ["tar", "xvf", "tcli.tar.gz"]
RUN ["mv", "-v", "tcli-0.1.4-linux-x64/tcli", "/"]
FROM ubuntu 
WORKDIR /
COPY --from=setup /tcli /bin/
COPY ./entrypoint.sh entrypoint.sh
RUN ["chmod", "+x", "entrypoint.sh"]
ENTRYPOINT ["entrypoint.sh"]
