const express = require('express');
const connection = require('./connection.js');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { ObjectID } = require('mongodb');
require('dotenv').config();

var Users, Requests, Rooms;
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {secure: false}
}));
app.use(passport.initialize())
app.use(passport.session());
connection((res_Users, res_Requests, res_Rooms)=>{
    Users = res_Users;
    Requests = res_Requests;
    Rooms = res_Rooms;
});
passport.serializeUser((user, done)=>{
    done(null, user._id);
});
passport.deserializeUser((id, done)=>{
    Users.findOne({_id: new ObjectID(id)}, (err, doc)=>{
        done(null, doc);
    })
})
passport.use(new LocalStrategy({
    usernameField: 'userID',
    passwordField: 'password'
    },
    (userID, password, done)=>{
    Users.findOne({admNo: userID},(err, user)=>{
        console.log('User', userID, 'attempted to login');
        if(err) {return done(err);}
        if(!user) {return done(null, false);}
        if(password != user.password){
            console.log("failed");
            return done(null, false);
        }
        return done(null, user);
    })
}));

app.use(express.static(__dirname + '/public'));

app.route('/loginInfo').post(passport.authenticate('local', {failureRedirect: '/my-requests'}), (req, res)=> {
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
app.get('/my-approvals', (req, res)=> {
    res.sendFile(process.cwd() + '/views/my-approvals.html');
})
app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));