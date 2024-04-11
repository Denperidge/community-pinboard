FROM node:lts AS build

WORKDIR /build

ENV NODE_ENV=development

SHELL [ "/bin/bash", "-c" ]

ADD package.json .
ADD yarn.lock .
ADD tsconfig.json .
ADD **/*.ts .
ADD public/fonts/* public/fonts/
ADD public/images/* public/images/
ADD views/* views/

RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:lts
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /build/package.json .
COPY --from=build /build/yarn.lock .
COPY --from=build /build/dist/**/* dist/

RUN yarn install --production --frozen-lockfile
RUN ls

CMD [ "yarn", "prod" ]
