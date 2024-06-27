# builder for server
FROM node:20-bookworm-slim as builder-server
LABEL author="Robert Jansen" maintainer="rjansengd@gmail.com"

USER root

RUN apt update && \
    apt install -y git bash

RUN npm i -g pnpm --force

COPY ./server/package.json /app/server/package.json
COPY ./server/pnpm-lock.yaml /app/server/pnpm-lock.yaml

RUN cd /app/server && \
    pnpm install --frozen-lockfile

COPY ./server/src /app/server/src
COPY ./server/tsconfig.json /app/server/tsconfig.json

RUN cd /app/server && \
    pnpm build

RUN cd /app/server && \
    pnpm prune --prod

# runner
FROM node:20-bookworm-slim as runner
LABEL author="Robert Jansen" maintainer="rjansengd@gmail.com"

USER root

RUN apt update && \
    apt install -y git bash

RUN npm i -g pnpm --force

COPY --from=builder-server /app/server/node_modules /app/server/node_modules
COPY --from=builder-server /app/server/lib /app/server/lib
COPY --from=builder-server /app/server/package.json /app/server/package.json

COPY ./.git /app/.git

RUN git config --system --add safe.directory '*'

COPY ./entrypoint.sh /entrypoint.sh

RUN mkdir /app/tmp
WORKDIR /app

CMD [ "/bin/bash", "/entrypoint.sh" ]