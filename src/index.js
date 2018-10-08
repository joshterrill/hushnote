const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const exphbs = require('express-handlebars');
const api = require('./api');
const config = require('./config.json');
var cron = require('node-cron');
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
  
  cronJob(db)
  // dropIndex(db)

  app.listen(port, () => {
    console.log('Listening on port ' + port);
    app.use(api({ db }));
    app.use((req, res) => {
      res.render('404');
    });
  });
});

const cronJob = (db) => {
  cron.schedule('* * * * *', () => {
    let date = Date.now()
    let query = { validTill: { "$lte": date }, read: true }
    db.collection('Notes').deleteMany(query, (err) => {
      if(err) {
        console.log(err)
      }
      else{
        console.log('Cron Job says: i have deleted messages')
      }
    })
  });
}

const dropIndex = (db) => {
  db.collection("Notes").dropIndex({createdAt: 1}, (err) => {
    if(err) {
      console.log(err)
    }
    else{
      console.log("Indexed Drop")
    }
  })
}