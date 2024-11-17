FROM node:22-alpine AS base
WORKDIR /app
COPY package.json yarn.lock ./

FROM base AS build
RUN [ "yarn", "install", "--frozen-lockfile" ]
COPY index.html ./
COPY public ./public
COPY src ./src
RUN ["yarn", "run", "build"]

FROM base AS final
RUN [ "yarn", "install", "--frozen-lockfile", "--production" ]
COPY --from=build /app/dist/ ./static
COPY server.js ./
CMD [ "node", "server.js" ]