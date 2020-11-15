const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const exphbs = require("express-handlebars");
const api = require("./api");
const MongoClient = mongodb.MongoClient;

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

app.engine("handlebars", exphbs({defaultLayout: "main", layoutsDir: `${__dirname}/views/layouts`}));
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views/");

MongoClient.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
    if (err) return console.error(err);
    app.listen(port, host, () => {
        console.log("Listening on port " + port);
        app.use(api({db: client.db(process.env.MONGO_DB)}));
        app.use((req, res) => {
            res.render("404");
        });
    });
});
