const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
const auth = require('./handlers/auth.js');
const DB = require('./handlers/connection.js');
const routes = require('./handlers/routes.js');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        sameSite: true
    }
}));
app.use(passport.initialize())
app.use(passport.session());

DB((Users, Requests, Rooms) =>{
    routes(app);
    auth.setStrategies(app, Users);
})

app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));