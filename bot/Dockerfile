FROM frolvlad/alpine-glibc:alpine-3.11_glibc-2.31

RUN apk update && apk add curl && apk add imagemagick && apk add zip

RUN curl -fsSL https://deno.land/x/install/install.sh | sh && mv /root/.deno/bin/deno /bin/deno 

WORKDIR /app
COPY src/ /app/

ENV TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
ENV TELEGRAPH_ACCESS_TOKEN=$TELEGRAPH_ACCESS_TOKEN
ENV API_KEY=$API_KEY
ENV API_BASE_URL=$API_BASE_URL
ENV TELEGRAPH_USERNAME=$TELEGRAPH_USERNAME
ENV TELEGRAPH_AUTHOR_URL=$TELEGRAPH_AUTHOR_URL
ENV OWNER_ID=$OWNER_ID

ENTRYPOINT ["deno"]

CMD ["run", "--allow-all", "main.ts"]
