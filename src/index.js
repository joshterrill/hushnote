const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const exphbs = require('express-handlebars');
const api = require('./api');
const config = require('./config.json');
const MongoClient = mongodb.MongoClient;

const app = express();
const port = process.env.PORT || config.port || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));

app.engine('handlebars', exphbs({defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts'}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views/');

let db = MongoClient.connect(config.environment.mongourl, (err, database) => {
  if (err) return console.log(err)
  db = database
  db.collection("Notes").createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 }, (err, result) => {
  	console.log('done')
  })
  app.listen(port, () => {
    console.log('Listening on port ' + port);
    app.use(api({ db }));
    app.use((req, res) => {
      res.render('404');
    });
  });
});