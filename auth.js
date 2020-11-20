const session = require('express-session');
const LocalStrategy = require('passport-local');
const passport = require('passport');
const { ObjectID } = require('mongodb');
const connection = require('./connection.js');
const bcrypt = require('bcrypt');

require('dotenv').config();

module.exports = {
    ensureAuthenticated : function ensureAuthenticated(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/login');
    },
    start: function start(app){
        var Users, Requests, Rooms;

        connection((res_Users, res_Requests, res_Rooms)=>{
            Users = res_Users;
            Requests = res_Requests;
            Rooms = res_Rooms;
        });
        app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: true,
            saveUninitialized: true,
            cookie: {secure: false}
        }));
        app.use(passport.initialize())
        app.use(passport.session());
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
                if(!bcrypt.compareSync(password, user.password)){
                    console.log("Wrong Password");
                    return done(null, false);
                }
                return done(null, user);
            })
        }));
        
    }
}