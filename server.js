const express = require('express');
const connection = require('./connection.js');
const bodyParser = require('body-parser');
const passport = require('passport');
const { ObjectID } = require('mongodb');
require('dotenv').config();

const app = express();
connection();
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {secure: false}
}));
app.use(passport.initialize(), passport.session());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

passport.serializeUser((user, done)=> {
    done(null, user._id);
})

passport.deserializeUser((id, done)=> {
    myDatabase.findOne({_id: new ObjectID(id)}, (err, doc)=>{
        if(err) console.error(err);
        done(null, null);
    })
})

app.post('/loginInfo', (req, res)=> {
    console.log(req.body);
    res.redirect('/');
})
app.get('/', (req, res)=> {
    res.sendFile(process.cwd() + '/views/home.html');
})

app.get('/login', (req, res)=> {
    res.sendFile(process.cwd() + '/views/login.html');
})

app.get('/my-requests', (req, res)=> {
    res.sendFile(process.cwd() + '/views/my-requests.html');
})

app.get('/new-request', (req, res)=> {
    res.sendFile(process.cwd() + '/views/new-request.html');
})
app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));