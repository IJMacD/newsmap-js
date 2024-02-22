FROM node:16 AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN [ "yarn", "install", "--frozen-lockfile" ]
COPY index.html ./
COPY public ./public
COPY src ./src
RUN ["yarn", "run", "build"]

FROM node:16-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN [ "yarn", "install", "--frozen-lockfile" ]
COPY --from=build /app/dist/ ./static
COPY server.js ./
CMD [ "node", "server.js" ]