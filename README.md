# Hushnote

A small application written in Node/Express on the server and vanilla javascript on the client. It allows you to send *client-side encrypted* one-time-use messages to someone via unique URL's that are generated on the server - once someone views the note, it is decrypted on the *client*, then destroyed.

<ins>*If you wish to take advantage of the client-side encryption/decryption, feel free to use the web UI hosted at: https://hush.dangerous.dev - if you want to implement the API in your own applications, endpoints prefixed with /api are still sever-side encrypted.*</ins>

There is also a public API that you can use if you would like to integrate it into your own applications.

Public URL: https://hush.dangerous.dev

## API Endpoints

### POST `/api/create/`

```
Headers: Content/Type = application/json
Body: {"note": "this is a test message"}
------------------------------------------
Success Response:
{
  "url": "https://hush.dangerous.dev/api/read/40312d32/160586e0",
  "error": null
}
```

### GET `/api/read/:key/:pass`

```
Success Response:
{
  "note": "this is a test message",
  "message": "Note has been destroyed."
}

Note Not Found Response:
{
  "note": null,
  "message": "Could not find note, perhaps it has already been destroyed?"
}

Incorrect Pass Response:
{
  "note": null,
  "message": "Incorrect URL parameters. Note has been destroyed."
}
```

## Spinning up your own instance

1. Check out the project by cloning it `git clone https://github.com/joshterrill/hushnote` and then `cd hushnote/`

2. Install dependencies by typing `npm install`

3. Create an `.env` file from a copy of `.env.example` by running `cp .env.example .env`

4. Add your mongodb connection string and other required variables to the `.env` file

5. Type `npm start` to run
