FROM node:16-alpine

LABEL maintainer="Mashiro (https://github.com/mashirozx)"

RUN npm i -g pnpm

WORKDIR /app

COPY . .

RUN pnpm --registry https://registry.npm.taobao.org install

CMD [ "node", "-v" ]
