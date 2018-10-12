# hushnote

A small application written in Node/Express on the server and vanilla javascript on the client. It allows you to send encrypted one-time-use messages to someone via unique URL's that are generated on the server - once someone views the note, the note is destroyed.

There is also a public API that you can use if you would like to integrate it into your own applications.

Public URL: https://hushnote.herokuapp.com

## API Endpoints

### POST `/api/create/`

```
Headers: Content/Type = application/json
Body: {"note": "this is a test message"}
------------------------------------------
Success Response:
{
  "url": "https://hushnote.herokuapp.com/read/40312d32/160586e0",
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

### Using Lando (https://docs.devwithlando.io/installation/installing.html)

1. Install Lando if you still dont have it (https://docs.devwithlando.io/installation/installing.html)

2. Check out the project by cloning it `git clone https://github.com/joshterrill/hushnote` and then `cd hushnote/`

3. Copy the `src/config.json.lando` file to `config.json` by typing `cp src/config.json.lando src/config.json`

4. Start your local environment by running `lando start`. After a few minutes you should be able to access your local environment by going to `https://hushnote.lndo.site` in your browser

### Manually

1. Check out the project by cloning it `git clone https://github.com/joshterrill/hushnote` and then `cd hushnote/`

2. Install dependencies by typing `npm install`

3. Rename the `src/config.json.example` file to be `config.json` by typing `mv src/config.json.example src/config.json`

4. Add your mongodb URL and secret passphrase to the `config.json` file

5. Type `npm start` to run
