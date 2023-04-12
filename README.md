# Preface

This project is a weekend botch job, it work as it is right now but its far far from being ideal/optimized/clean.

## How to use

### Requirements

- [docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

### Setup

- Clone the repository
- If you want to go and just use the bot with the api, fill in the ENV variables in the docker-compose file and run `docker-compose up -d`

## Telegram exhentai/e-hentai bot

This is a repository containing 2 projects :

- The telegram bot [bot/README.md](bot/README.md)
- The API backend [api/README.md](api/README.md)

## The telegram bot

The bot itself is built ontop of Deno using the grammy module. It handles the user interaction on telegram aswell as posting the doujin to telegra.ph.

### Built with

- Deno
- Typescript
- Grammy
- telegraph module (from grammy)

### Features

- Usage tracking per user (how many doujins fetched)
- Fetch doujins from a URL, fetch a random doujin or fetch a random doujin with tags
- Post the doujin to telegra.ph
- Post the gallery to the user's telegram chat
- Zip the gallery and send it to the user's telegram chat

## The API backend

The backend to both the API and the Web interface. It interfaces with a MongoDB instance that stores all the user/doujin data. This is where the doujin fetching part happens. The bot on it's own can't do anything. The idea here was to separate this logic from the bot in the hopes that it could be reused on the interface to browse a user's collection and be able to fetch doujins from the same interface.

### Built with

- Express
- Typescript
- Mongoose
- morgan,helmet & cors

### Features

- User manipulation (create/delete/modify)
- Doujin manipulation (create/delete/modify)
- Settings manipulation (create/delete/modify)
- Logs (create/delete)
- Fetch doujins from E/Ex-hentai
