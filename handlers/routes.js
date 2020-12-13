const auth = require('./auth.js');
const passport = require('passport');
const requestService = require('./requestService.js');
const getData = require('./getData.js');
const userService = require('./userService.js');

function showError(req, res, err){
    req.flash('error', err);
    res.redirect('/error');
}

function showSuccess(req, res, message){
    req.flash('success', message);
    res.redirect('/success');
}

module.exports = function (app) {
    app.route('/')
    .get(auth.ensureAuthenticatedForHome, (req, res) => {
        res.sendFile(process.cwd() + '/views/home.html');
    });

    app.route('/getData/events/:number')
    .get((req, res) => {
        Promise.all([getData.previousEvents(req.params.number), getData.upcomingEvents(req.params.number)])
        .then(values => {
            res.send({previous: values[0], upcoming: values[1]})
        })
        .catch(err => showError(req, res, err));
    })
    app.route('/getData/upcoming-events')
    .get((req, res) => {
        getData.upcomingEvents()
        .then(data => res.send(data))
        .catch(err=>showError(req, res, err))
    })

    app.route('/getData/previous-events')
    .get((req, res) => {
        getData.previousEvents()
        .then(data => res.send(data))
        .catch(err=>showError(req, res, err));
    })

    app.route('/getData/manage-users')
    .get(auth.ensureAuthenticated, (req, res)=>{
        Promise.all([getData.unapprovedUsers(req.user), getData.children(req.user)])
        .then(data=>res.send({unapprovedUsers: data[0], children: data[1]}))
        .catch(err=>showError(req, res, err))
    })

    app.route('/getData/user-requests')
    .get(auth.ensureAuthenticated, (req, res) => {
        getData.requests(req.user)
        .then(data => res.send(data))
        .catch(err=>showError(req, res, err))
    })
    app.route('/getData/user-approvals')
    .get(auth.ensureAuthenticated, (req, res) => {
        getData.approvals(req.user)
        .then(data => res.send(data))
        .catch(err=>showError(req, res, err))
    })

    app.route('/register')
    .get((req, res) => {
        res.sendFile(process.cwd() + '/views/register.html');
    })
    .post((req, res) => {
        userService.add(req.body)
        .then(email => {
            req.session.email = email;
            res.redirect('/register/verify');
        })
        .catch(err=>showError(req, res, err))
    })

    app.route('/register/verify')
    .get((req, res) => {
        res.sendFile(process.cwd() + '/views/verify.html')
    })
    .post((req, res) => {
        userService.verify(req.session.email, req.body.otp)
        .then(message=>showSuccess(req, res, message))
        .catch(err=>showError(req, res, err))
    })

    app.route('/login')
    .get((req, res) => {
        res.sendFile(process.cwd() + '/views/login.html');
    })
    .post(passport.authenticate('local', { failureRedirect: '/error', failureFlash: true }), (req, res) => {
        res.cookie('username', req.user.name);
        res.cookie('role', req.user.role);
        var url = req.session.redirectTo || '/';
        delete req.session.redirectTo;
        res.redirect(url);
    })

    app.route('/auth/google')
    .get(passport.authenticate('google', { scope: ["profile", "email"] }));

    app.route('/auth/google/callback')
    .get(passport.authenticate('google', { failureRedirect: '/error', failureFlash: true }), (req, res) => {
        res.redirect('/my-requests');
    });

    app.route('/change-password')
    .get(auth.ensureAuthenticated, (req, res)=>{
        res.sendFile(process.cwd() + '/views/change-password.html');
    })
    .post(auth.ensureAuthenticated, (req, res)=>{
        userService.changePassword({
            userID: req.user._id,
            oldPassword: req.body.oldPsw,
            newPassword: req.body.newPsw,
            confirmNewPassword: req.body.confirmNewPsw
        })
        .then(message=>{
            req.logout();
            showSuccess(req, res, message);
        })
        .catch(err=>showError(req, res, err));
    })

    app.route('/forgot-password')
    .get((req, res)=>{
        res.sendFile(process.cwd() + '/views/forgot-password.html');
    })
    .post((req, res)=>{
        userService.forgotPassword(req.body.email)
        .then(message=>showSuccess(req, res, message))
        .catch(err=>showError(req, res, err))
    })

    app.route('/reset-password/:randomValue')
    .get((req, res)=>{
        userService.verifyResetLink(req.params.randomValue)
        .then(()=>{
            res.sendFile(process.cwd() + '/views/reset-password.html');
        })
        .catch(err=>showError(req, res, err))
    })
    .post((req, res)=>{
        userService.resetPassword({
            randomValue: req.params.randomValue,
            password: req.body.psw,
            confirmPassword: req.body.confirmPsw
        })
        .then(message=>showSuccess(req, res, message))
        .catch(err=>showError(req, res, err))
    })

    app.route('/manage-users')
    .get(auth.ensureAuthenticated, (req, res) => {
        res.sendFile(process.cwd() + '/views/manage-users.html');
    })
    .post(auth.ensureAuthenticated, (req, res)=>{
        var userID = Object.getOwnPropertyNames(req.body)[0];
        userService.updateUnapproved({id: userID, order: req.body[userID]})
        .then(()=>{
            res.redirect('/manage-users');
        })
        .catch(err=>showError(req, res, err))
    })

    app.route('/my-requests')
    .get(auth.ensureAuthenticated, (req, res) => {
        res.sendFile(process.cwd() + '/views/my-requests.html');
    })

    app.route('/new-request')
    .get(auth.ensureAuthenticated, (req, res) => {
        res.sendFile(process.cwd() + '/views/new-request.html');
    })
    .post(auth.ensureAuthenticated, (req, res) => {
        requestService.saveRequest(req.body, req.user)
        .then((message) => {
            res.redirect('/my-requests');
        })
        .catch(err=>showError(req, res, err))
    })

    app.route('/my-approvals')
    .get(auth.ensureAuthenticated, (req, res) => {
        res.sendFile(process.cwd() + '/views/my-approvals.html');
    })
    .post(auth.ensureAuthenticated, (req, res) => {
        var requestID = Object.getOwnPropertyNames(req.body)[0];
        requestService.update({
            userID: req.user._id,
            requestID: requestID,
            response: req.body[requestID]
        })
        .then(message=>res.redirect('/my-approvals'))
    });

    app.route('/success')
        .get((req, res) => {
            res.send(req.flash('success')[0])
        })
    app.route('/error')
        .get((req, res) => {
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