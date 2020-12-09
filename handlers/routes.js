const auth = require('./auth.js');
const passport = require('passport');
const requestHandle = require('./requestHandle.js');
const getData = require('./getData.js');

module.exports = function (app) {
    
    app.get('/', (req, res) => {
        res.sendFile(process.cwd() + '/views/home.html');
    })
    app.route('/login')
        .get((req, res) => {
            res.sendFile(process.cwd() + '/views/login.html');
        })
        .post(passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
            res.cookie('User Name', req.user.name);
            res.cookie('Level', req.user.level);
            var url = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(url);
        })
    app.route('/auth/github')
        .get(passport.authenticate('github'));
    
    app.route('/auth/github/callback')
        .get(passport.authenticate('github',{failureRedirect: "/login"}), (req, res)=>{
            console.log("here");
            res.redirect('/');
        })

    app.route('/my-requests')
        .get(auth.ensureAuthenticated, (req, res) => {
            res.sendFile(process.cwd() + '/views/my-requests.html');
        })
    app.route('/user-requests')
        .get(auth.ensureAuthenticated, (req, res) => {
            getData.requests(req.user)
            .then(data => res.send(data))
            .catch(err=>{
                console.error(err);
                res.send("Error Occured");
            })
        })
    app.route('/user-approvals')
        .get(auth.ensureAuthenticated, (req, res)=>{
            getData.approvals(req.user)
            .then(data=>res.send(data))
            .catch(err=>{
                console.error(err);
                res.send("Error Occured");
            })
        })

    app.route('/new-request')
        .get(auth.ensureAuthenticated, (req, res) => {
            res.sendFile(process.cwd() + '/views/new-request.html');
        })
        .post(auth.ensureAuthenticated, (req, res)=>{
            requestHandle.saveRequest(req.body, req.user)
            .then((message)=>{
                res.redirect('/my-requests');
            })
            .catch((err)=>{
                console.error(err.name + ": " + err.message);
                res.send(err.message);
            })
        })

    app.route('/my-approvals')
        .get(auth.ensureAuthenticated, (req, res) => {
            res.sendFile(process.cwd() + '/views/my-approvals.html');
        })
        .post(auth.ensureAuthenticated, async (req, res)=> {
            var requestID = Object.getOwnPropertyNames(req.body)[0];
            await requestHandle.update({
                userID: req.user._id,
                requestID: requestID,
                response: req.body[requestID]
            });
            res.redirect('/my-approvals');
        })

    app.route('/logout')
        .get((req, res) => {
            req.logout();
            res.redirect('/');
        })

    app.use((req, res, next) => {
        res.status(404)
            .type('txt')
            .send('Not Found');
    });
}