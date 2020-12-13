const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();
const auth = require('./handlers/auth.js');
const routes = require('./handlers/routes.js');
const initial = require('./handlers/initial.js');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));
app.use(flash());
app.use(passport.initialize())
app.use(passport.session());


mongoose.connect(process.env.URI, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(()=>{
        console.log("CONNECTED TO DB");
        //initial();
        routes(app);
        auth.setStrategies(app);
    })
    .catch(error => console.log(error));

app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));