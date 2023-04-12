# Telegram Bot Exhentai API

This is a Telegram Bot API for Exhentai. It's used to scrape the exhentai website and return the results to the user. It's also how the bot interfaces with the MongoDB database. The bot is useless without this API.

This api was made for personal use. This was mostly coded on late nights so excuse the mess.

*This is a way a fork of my private telegram bot stack, I modified some critical parts of it, I have quickly tested it and it seems to work okay. But I can't guarentee stability.*

## Features

- [x] Scrape doujins from exhentai/e-hentai by URL
- [x] Scrape random doujins from exhentai/e-hentai
- [x] Manage settings via API calls
- [x] Manage users via API calls
- [x] Manage doujins via API calls
- [x] Access logs via API calls

## Dependencies

- [nodejs](https://nodejs.org/en/)
- [mongodb](https://www.mongodb.com/)

## Routes

If for some reason you want to use the API directly, here are the routes:

See [routes.md](routes.md)

## Environment variables

Here are the environment variables you need to set either in a `.env` file or in the docker-compose file:

- `MONGO_URI_PROD` - MongoDB URI -> You will have to create a MongoDB Instance.
- `MONGO_URI_DEV` - Same as above but for development (optional)
- `EXHENTAI_COOKIE` - Cookie for exhentai -> You will have to get this cookie from your browser.
- `NODE_ENV` - `production` or `development`
- `PORT` - 8000 is the default , ideally leave it as is.
- `API_KEY` - The API key you want, this needs to be set in the bot as well. It can be as simple as a random string.

## Exhentai Cookie

You need to get the cookie from your browser. I won't explain how to access exhentai, you can figure it out yourself. Once you are logged in, you need to get the cookie from your browser. Here is how to do it in chrome:

- Open the developer tools (F12)
- Go to the `Application` tab
- Go to `Cookies` -> `https://exhentai.org`
- Copy the `ipb_member_id` , `ipb_pass_hash` , `igneous` , `sl` and `sk` values.
- Paste them in the following format:
 `'ipb_member_id=123456789; ipb_pass_hash=123456789; igneous=123456789; sl=123456789; sk=123456789;'`


## Setup

```
npm install
```

## Lint

```
npm run lint
```

## Development

```
npm run dev
```
