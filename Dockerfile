FROM node:16 AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY .env index.html ./
COPY public ./public
COPY src ./src
RUN yarn run build

FROM node:16-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY --from=build /app/dist/ ./static
COPY server.js ./
CMD [ "node", "server.js" ]