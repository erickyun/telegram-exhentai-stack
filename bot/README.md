# Telegram Bot

This telegram bot that requests doujins or random doujins from [exhentai](https://exhentai.org/) or [e-hentai](https://e-hentai.org). This bot is useless without the Express API.

This bot was made for personal use to avoid copy pasting entire galleries into telegram. This was mostly coded on late nights so excuse the mess.

*This is in a way a fork of my private telegram bot, I modified some critical parts of it, I have quickly tested it and it seems to work okay. But I can't guarentee stability.*

## Features

- [x] Get random doujin w/ tags or without
- [x] Get doujin by URL
- [x] Send doujin as a zip file
- [x] Send doujin as a telegraph page
- [x] Send doujin as a telegram album
- [x] Customizable settings via the Express API or Bot via /settings
- [x] Whitelist users (No rate limit for whitelisted users)

## Dependencies

if you want to run this bot outside of docker, you need to install the following dependencies (UNIX/Linux, windows user use [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)):

- [imagemagick](https://imagemagick.org/index.php)
- [wget](https://www.gnu.org/software/wget/)
- [zip](https://linux.die.net/man/1/zip)
- [deno](https://deno.land/)

## Settings

To change the settings, you can either use the Express API or the bot in a limited fashion (or directly in the MongoDB database). To change the settings via the bot use the `/settings` command. This will show you the current settings and allow you to modify them. Follow the instructions, this feature was added in a hurry so it's not very user friendly, this is not how i normaly interface with the bot.



## Commands

- `/start` - start the bot
- `/info` - show info about the bot
- `/help` - show help
- `/random` - get random doujin
- `/fetch` - get doujin by URL
- `/stats` - show usage stats
- `/settings` - show settings
- `/myid` - show your telegram id

## Random command

The random command will get a random doujin from [exhentai](https://exhentai.org/) or [e-hentai](https://e-hentai.org) and send it to you. You can also specify tags to get a random doujin with those tags.

### Examples random

`/random` - get random doujin

`/random #tag1 #tag_2` - get random doujin with tags `tag1` and `tag_2` (use `_` instead of spaces and `#` before the tag)

`/random #tag1 #tag_2 (#tag3)` - get random doujin with tags `tag1` and `tag_2` but without `tag3` (the tags in brackets are excluded)

## Fetch command

The fetch command will get a doujin from [exhentai](https://exhentai.org/) or [e-hentai](https://e-hentai.org) from the URL you provide and send it to you.

### Examples fetch

`/fetch https://exhentai.org/g/1234567/84fe951716` - get doujin with URL `https://exhentai.org/g/1234567/84fe951716`

## Docker

You can run this bot in docker. You need to have [docker](https://www.docker.com/).

```bash
docker build -t telegram-bot .
docker run -d --name telegram-bot telegram-bot
```

## Run

You can run this bot outside of docker. You need to have [deno](https://deno.land/) installed. You need to have a .env file in the src folder with the environment variables (see below).

```bash
cd src
deno run --allow-env --allow-write --allow-read --allow-net main.ts
```

## Environment variables

These are the environment variables you need to set either in the .env file inside the src folder or in the docker-compose.yml file from the parent directory.

- `TELEGRAM_BOT_TOKEN` - telegram bot token
- `TELEGRAPH_ACCESS_TOKEN` - telegraph access token
- `API_KEY` - api key for the Express API
- `API_BASE_URL` - base url for the Express API (if not using docker/docker-compose)
- `TELEGRAPH_USERNAME` - telegraph username
- `TELEGRAPH_AUTHOR_URL` - telegraph author url
- `OWNER_ID` - telegram id of the owner of the bot



## Disclaimer

This code comes with no warranty, use at your own risk. I am not responsible for any damage caused by this code (not that it would do anything bad, but still).

This code is provided as is, without any support. If you have any questions, feel free to open an issue.
