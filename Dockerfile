FROM node:20 AS build-stage 
WORKDIR /usr/src/app
COPY backend backend
COPY frontend frontend
WORKDIR /usr/src/app/backend
RUN npm ci
RUN npm run build
RUN npm ci --omit=dev
WORKDIR /usr/src/app/frontend
RUN npm ci
RUN npm run build

FROM node:20
ENV NODE_ENV=production
USER node
COPY --from=build-stage --chown=node:node /usr/src/app/backend/build /var/www/app
COPY --from=build-stage --chown=node:node /usr/src/app/backend/node_modules /var/www/app/node_modules
COPY --from=build-stage --chown=node:node /usr/src/app/frontend/dist /var/www/app/dist
WORKDIR /var/www/app

CMD ["node", "index.js"]