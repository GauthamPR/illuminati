const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
require('dotenv').config();
const auth = require('./auth.js');

const app = express();
auth.start(app);
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res)=> {
    res.sendFile(process.cwd() + '/views/home.html');
})
app.route('/login')
    .get((req, res)=> {
        res.sendFile(process.cwd() + '/views/login.html');
    })
    .post(passport.authenticate('local', {failureRedirect: '/my-requests'}), (req, res)=> {
        res.cookie('User Name', req.user.name);
        res.cookie('Level', req.user.level);
        res.redirect('/');
    })

app.route('/my-requests')
    .get(auth.ensureAuthenticated, (req, res)=> {
        res.sendFile(process.cwd() + '/views/my-requests.html');
    })

app.route('/new-request')
    .get(auth.ensureAuthenticated, (req, res)=> {
        res.sendFile(process.cwd() + '/views/new-request.html');
    })

app.route('/my-approvals')
    .get(auth.ensureAuthenticated, (req, res)=> {
        res.sendFile(process.cwd() + '/views/my-approvals.html');
    })

app.route('/logout')
    .get((req, res)=>{
        req.logout();
        res.redirect('/');
    })

app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));