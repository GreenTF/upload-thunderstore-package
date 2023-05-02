FROM denoland/deno as cache
ENV DENO_DIR=/var/tmp/deno_cache
COPY ./cfg_edit.js /cfg_edit.js
RUN deno cache /cfg_edit.js
FROM ghcr.io/greentf/tcli
ENV DENO_DIR=/var/tmp/deno_cache
COPY --from=cache ${DENO_DIR} ${DENO_DIR}
COPY ./entrypoint.sh /entrypoint.sh
COPY ./cfg_edit.js /cfg_edit.js
RUN ["chmod", "+x", "/entrypoint.sh"]
ENTRYPOINT ["/entrypoint.sh"]
