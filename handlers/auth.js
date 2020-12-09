const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;
const passport = require('passport');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');
const customModel = require('./models.js');

require('dotenv').config();

module.exports = {
    ensureAuthenticated : function ensureAuthenticated(req, res, next){
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
        
        passport.use(new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/github/callback" 
        },(accessToken, refreshToken, profile, cb)=>{
            customModel.Users.findOneAndUpdate(
                { id: profile.id },
                {
                  $setOnInsert: {
                    id: profile.id,
                  },
                  $set: {
                    last_login: new Date()
                  },
                  $inc: {
                    login_count: 1
                  }
                },
                { upsert: true, new: true },
                (err, doc) => {
                  return cb(null, doc.value);
                }
              );
        }))
    }
}