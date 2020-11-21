const LocalStrategy = require('passport-local');
const passport = require('passport');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');

require('dotenv').config();

module.exports = {
    ensureAuthenticated : function ensureAuthenticated(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/login');
    },
    setStrategies: function (app, Users){
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