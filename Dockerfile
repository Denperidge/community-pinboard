FROM node:lts AS build
WORKDIR /build
ENV NODE_ENV=development

ADD . .

RUN yarn install --frozen-lockfile
RUN yarn build

RUN [ "tar", "-vc", "--file=build.tar", "package.json", "yarn.lock", "dist" ]

FROM node:lts
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /build/build.tar /app/build.tar

RUN [ "tar", "-xv", "--file=build.tar" ]
RUN [ "rm", "build.tar" ]

RUN yarn install --production --frozen-lockfile

CMD [ "yarn", "prod" ]
