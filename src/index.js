const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongodb = require('mongodb');
const { engine } = require('express-handlebars');
const scheduler = require('node-schedule');
const api = require('./api');
const MongoClient = mongodb.MongoClient;

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static('src/public'));

app.engine('handlebars', engine({ defaultLayout: 'main', layoutsDir: `${__dirname}/views/layouts` }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

async function createScheduler(db) {
    scheduler.scheduleJob('0 2 * * *', () => {
        try {
            await db.collection('notes').deleteMany({timestamp: {$lt: getDaysPastDate(+process.env.DELETE_STALE_MESSAGES_DAYS)}})
        } catch (error) {
            console.error('Unable to fetch notes for automated scheduler', error);
        }
    });
}

MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    app.listen(port, host, () => {
        console.log(`Listening on port ${port}`);
        const db = client.db(process.env.MONGO_DB);
        app.use(api(db));
        app.use((req, res) => {
            res.render('404');
        });
        if (process.env.DELETE_STALE_MESSSAGES == 'true') {
            createScheduler(db);
        }
    });
});
