const auth = require('./auth.js');
const passport = require('passport');
const requestService = require('./requestService.js');
const getData = require('./getData.js');
const user = require('./userService.js');

module.exports = function (app) {
    
    app.get('/', (req, res) => {
        res.sendFile(process.cwd() + '/views/home.html');
    })

    app.route('/')
        .get((req, res) => {
            res.sendFile(process.cwd() + '/views/home.html');
        });
    app.route('/events')
        .get((req, res)=>{
            Promise.all([getData.previous(4), getData.upcoming(4)])
                .then(values=>{
                    res.send({
                        previous: values[0],
                        upcoming: values[1]
                    })
                })
                .catch(e=>console.error(e));
        })
    app.route('/upcoming')
        .get((req, res)=>{
            getData.upcoming()
                .then(data=> res.send(data));
        });
    
    app.route('/previous')
        .get((req, res)=>{
            getData.previous()
                .then(data=> res.send(data));
        })
    app.route('/register')
        .get((req, res)=>{
            res.sendFile(process.cwd() + '/views/register.html');
        })
        .post((req, res)=>{
            user.add(req.body)
                .then(email=>{
                    console.log(email);
                    req.session.email = email;
                    res.redirect('/register/verify');
                })
                .catch((err)=>{
                    console.log(err);
                    req.flash('error', err);
                    res.redirect('/error');
                })
        })
    app.route('/register/verify')
        .get((req, res)=>{
            res.sendFile(process.cwd() + '/views/verify.html')
        })
        .post((req, res)=>{
            user.verify(req.session.email, req.body.otp)
                .then(message=>{
                    req.flash('success', message);
                    res.redirect('/success');
                })
                .catch(err=>{
                    req.flash('error', err);
                    res.redirect('/error')
                })
        })
    app.route('/login')
        .get((req, res) => {
            res.sendFile(process.cwd() + '/views/login.html');
        })
        .post(passport.authenticate('local', { failureRedirect: '/error', failureFlash: true}), (req, res) => {
            res.cookie('User Name', req.user.name);
            res.cookie('Level', req.user.level);
            var url = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(url);
        })

    /*app.route('/auth/github')
        .get(passport.authenticate('github'));

    app.route('/auth/github/callback')
        .get(passport.authenticate('github',{failureRedirect: "/error", failureFlash: true}), (req, res)=>{
            req.session.user_id = req.user.id;
            res.redirect('/my-requests');
        })
    */
   
    app.route('/auth/google')
        .get(passport.authenticate('google', {scope: ["profile", "email"]}));

    app.route('/auth/google/callback')
        .get(passport.authenticate('google', {failureRedirect: '/error', failureFlash: true}), (req, res)=>{
            res.redirect('/my-requests');
        });

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
            requestService.saveRequest(req.body, req.user)
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
            await requestService.update({
                userID: req.user._id,
                requestID: requestID,
                response: req.body[requestID]
            });
            res.redirect('/my-approvals');
        });
        
    app.route('/success')
        .get((req, res)=>{
            res.send(req.flash('success')[0])
        })
    app.route('/error')
        .get((req, res)=>{
            res.send(req.flash('error')[0]);
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