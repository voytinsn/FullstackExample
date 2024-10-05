FROM node:20 AS build-stage 
COPY ../mock  /usr/src/mock
WORKDIR /usr/src/mock
RUN npm ci
RUN npm run build
RUN npm ci --omit=dev

FROM node:20
ENV NODE_ENV=demo
USER node
COPY --from=build-stage --chown=node:node /usr/src/mock/build /var/www/mock
COPY --from=build-stage --chown=node:node /usr/src/mock/node_modules /var/www/mock/node_modules
WORKDIR /var/www/mock

CMD ["node", "index.js"]
