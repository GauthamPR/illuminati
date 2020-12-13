const LocalStrategy = require('passport-local');
//const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');
const customModel = require('./models.js');

require('dotenv').config();

module.exports = {
    ensureAuthenticatedForHome: function (req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.sendFile(process.cwd() + '/views/public-home.html');
    },

    ensureAuthenticated : function (req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.session.redirectTo = req.originalUrl;
        res.redirect('/login');
    },
    setStrategies: function (app){
        var Users = customModel.Users;

        passport.serializeUser((user, done)=>{
            done(null, user._id);
        });
        passport.deserializeUser((id, done)=>{
            Users.findOne({_id: new ObjectID(id)}, (err, doc)=>{
                if(err) console.error(err);
                done(null, doc);
            })
        })
        passport.use(new LocalStrategy({
            usernameField: 'admNo',
            passwordField: 'password'
            },
            (admNo, password, done)=>{
            Users.findOne({admNo: admNo},(err, user)=>{
                console.log('User', admNo, 'attempted to login');
                if(err) {return done(err);}
                if(!user) {return done(null, false, {message: 'User Not Registered'});}
                if(!bcrypt.compareSync(password, user.password)){
                    return done(null, false, {message: 'Wrong Password'});
                }
                return done(null, user);
            })
        }));
        
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback"
        },(accessToken, refreshToken, profile, cb)=>{
            console.log(profile);
            customModel.Users.findOneAndUpdate({email: profile.emails[0].value},
                {
                    googleID: profile.id,
                    last_login: new Date(),
                    $inc: {login_count: 1}
                },
                (err, doc)=>{
                    if(err) console.error(err);
                    if(doc)
                        return cb(null, doc);
                    else
                        return cb(null, false, {message: "User Not Registered"});
                })
        }))

        /*passport.use(new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/github/callback" 
        },(accessToken, refreshToken, profile, cb)=>{
            console.log(profile);
            customModel.Users.findOneAndUpdate({ email: profile.emails[0].value },
                {
                    githubID: profile.id,
                    last_login: new Date(),
                    $inc: {
                        login_count: 1
                    }
                },
                (err, doc) => {
                    if(err) console.error(err);
                    if(doc)
                        return cb(null, doc);
                    else
                        return cb(null, false, {message: "User Not Registered"});
                }
              );
        }))*/
    }
}