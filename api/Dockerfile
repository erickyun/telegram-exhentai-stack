FROM --platform=linux/amd64 node:19-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i --omit=dev

COPY ./dist .

ENV MONGO_URI_PROD=$MONGO_URI_PROD
ENV EXHENTAI_COOKIE=$EXHENTAI_COOKIE
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT
ENV API_KEY=$API_KEY

EXPOSE $PORT

CMD ["node","index.js"]