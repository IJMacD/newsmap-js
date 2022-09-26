FROM node:16 AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY src ./src
COPY public ./public
RUN yarn run build

FROM node:16
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY --from=build /app/build/ ./static
COPY server.js ./
CMD [ "node", "server.js" ]