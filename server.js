const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();
const auth = require('./handlers/auth.js');
const routes = require('./handlers/routes.js');
const initial = require('./handlers/initial.js');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    key: 'express.sid',
    cookie: {
        secure: false,
        sameSite: true
    },
    store: store
}));
app.use(passport.initialize())
app.use(passport.session());


mongoose.connect(process.env.URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(()=>{
        console.log("CONNECTED TO DB");
        //initial();
        routes(app);
        auth.setStrategies(app);
    })
    .catch(error => console.log(error));

app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));