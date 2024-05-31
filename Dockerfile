FROM node:lts-alpine AS build
WORKDIR /build
ENV NODE_ENV=development

ADD . .

RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:lts-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV DATA_DIR=/app/data/

COPY --from=build /build/dist/ /app/dist/
COPY --from=build /build/package.json /app/package.json
COPY --from=build /build/yarn.lock /app/yarn.lock

RUN yarn install --production --frozen-lockfile

CMD [ "yarn", "prod" ]
