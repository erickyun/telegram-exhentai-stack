# API Routes

## Base URL : `http://{hostname}:{port}/api/v1`

Quick and dirty API docs.

### /

`GET /` - Get all available routes.

### /doujins/exhentai/

`GET /doujins/exhentai/` - Get all exhentai doujins.

`GET /doujins/exhentai/:id` - Get exhentai doujin by `_id` or doujin id.

`POST /doujins/exhentai/get` - Fetch exhentai doujin by URL in body.

```json
{
  "url": "https://exhentai.org/g/1234567/84fe951716"
}
```

`POST /doujins/exhentai/random` - Get random exhentai doujin. (Refer to bot README for tag info). Tags in body (optional).

```json
{
  "tags": "#tag1 #tag_2 (#tag3)"
}
```

`GET /doujins/exhentai/count` - Get exhentai doujin count.

`PUT /doujins/exhentai/:id` - Update exhentai doujin by `_id` or doujin id. Put the new values in the body.

```json
{
  "title": "New title",
  "telegraph_url": "https://telegra.ph/New-telegraph-url-01-01"
}
```

`DELETE /doujins/exhentai/:id` - Delete exhentai doujin by `_id` or doujin id.

### /users/

`GET /users/` - Get all users.

`GET /users/count` - Get user count.

`GET /users/:id` - Get user by `_id` or telegram id.

`GET /users/exist/:id` - Check if user exists by `_id` or telegram id. (Returns `_id` if exists, else returns `null`)

`POST /users/` - Create new user. Put the new values in the body.

```json
{
  "user_id":2131331,
  "username":"someuser"
}
```

`PUT /users/:id` - Update user by `_id` or telegram id. Put the new values in the body.

```json
{
  "username":"newusername"
}
```

`DELETE /users/:id` - Delete user by `_id` or telegram id.

### /settings/

`GET /settings/` - Get settings.

`POST /settings/` - Create settings, altough you shouldn't need to hit this route since I only have one settings document and it's created on first run.

`PUT /settings` - Update settings. Put the new values in the body.

```json
{
  "max_daily_use": 20,
  "max_files": 70,
}
```

### /logs/

`GET /logs/` - Get all logs.

`POST /logs` - Create new log. Put the new values in the body.

```json
{
  "level":"error",
  "message":"Failed to find doujins",
  "timestamp":"24 feb 2023"
}
```

`DELETE /logs/:id` - Delete log by `_id`.

`DELETE /logs` - Delete all logs.
