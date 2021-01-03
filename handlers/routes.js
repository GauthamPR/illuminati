const auth = require('./auth.js');
const passport = require('passport');
const requestService = require('./requestService.js');
const getData = require('./getData.js');
const userService = require('./userService.js');

const routeName = {
    '/login'            : 'Login Page',
    '/change-password'  : 'Changing password',
    '/register'         : 'Registering',
    '/register/verify'  : 'Entering OTP',
    '/forgot-password'  : 'Entering email',
    'javascript:history.back()'      : 'Creating New Request',
    '/': 'Home'
};

function showError(req, res, err, redirect){
    req.flash('redirect', redirect);
    req.flash('error', err);
    res.redirect('/failure');
}

function showSuccess(req, res, message, redirect){
    req.flash('redirect', redirect);
    req.flash('success', message);
    res.redirect('/success');
}

module.exports = function (app) {
    app.route('/')
    .get(auth.ensureAuthenticatedForHome, (req, res) => {
        res.sendFile(process.cwd() + '/views/home.html');
    });

    app.route('/getData/supervisors')
    .get((req, res)=>{
        getData.supervisors()
        .then(data=>res.send(data));
    })
    app.route('/getData/halls')
    .get((req, res)=>{
        getData.halls()
        .then(data=>res.send(data));
    })
    app.route('/getData/events/:number')
    .get((req, res) => {
        Promise.all([getData.previousEvents(req.params.number), getData.upcomingEvents(req.params.number)])
        .then(values => {
            res.send({previous: values[0], upcoming: values[1]})
        })
        .catch(err => {
            console.error(err);
            res.send("Error Retrieving Data");
        });
    })
    app.route('/getData/upcoming-events')
    .get((req, res) => {
        getData.upcomingEvents()
        .then(data => res.send(data))
        .catch(err => {
            console.error(err);
            res.send("Error Retrieving Data");
        });
    })

    app.route('/getData/previous-events')
    .get((req, res) => {
        getData.previousEvents()
        .then(data => res.send(data))
        .catch(err => {
            console.error(err);
            res.send("Error Retrieving Data");
        });
    })

    app.route('/getData/manage')
    .get(auth.ensureAuthenticated, (req, res)=>{
        Promise.all([getData.unapprovedUsers(req.user), getData.children(req.user)])
        .then(data=>res.send({unapprovedUsers: data[0], children: data[1]}))
        .catch(err => {
            console.error(err);
            res.send("Error Retrieving Data");
        });
    })

    app.route('/getData/user-requests')
    .get(auth.ensureAuthenticated, (req, res) => {
        getData.requests(req.user)
        .then(data => res.send(data))
        .catch(err => {
            console.error(err);
            res.send("Error Retrieving Data");
        });
    })
    app.route('/getData/user-approvals')
    .get(auth.ensureAuthenticated, (req, res) => {
        Promise.all([getData.pendingApprovals(req.user), getData.allApprovals(req.user)])
        .then(data => res.send({
            pendingApprovals: data[0],
            allApprovals: data[1]
        }))
        .catch(err => {
            console.error(err);
            res.send("Error Retrieving Data");
        });
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
        .catch(err=>showError(req, res, err, '/register'))
    })

    app.route('/register/verify')
    .get((req, res) => {
        res.sendFile(process.cwd() + '/views/verification.html')
    })
    .post((req, res) => {
        userService.verify(req.session.email, req.body.otp)
        .then(message=>showSuccess(req, res, message, '/'))
        .catch(err=>showError(req, res, err, '/register/verify'))
    })

    app.route('/login')
    .get((req, res) => {
        res.sendFile(process.cwd() + '/views/login.html');
    })
    .post(passport.authenticate('local', { failureRedirect: '/altFailure', failureFlash: true }), (req, res) => {
        res.cookie('username', req.user.name);
        res.cookie('role', req.user.role.join(','));
        var url = req.session.redirectTo || '/';
        delete req.session.redirectTo;
        res.status(200).json({redirectLink: url, message: "Login Successful!"});
    })

    app.route('/auth/google')
    .get(passport.authenticate('google', { scope: ["profile", "email"] }));

    app.route('/auth/google/callback')
    .get(passport.authenticate('google', { failureRedirect: '/failure', failureFlash: true }), (req, res) => {
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
            showSuccess(req, res, message, '/login');
        })
        .catch(err=>showError(req, res, err, '/change-password'));
    })

    app.route('/forgot-password')
    .get((req, res)=>{
        res.sendFile(process.cwd() + '/views/forgot-password.html');
    })
    .post((req, res)=>{
        userService.forgotPassword(req.body.email)
        .then(message=>showSuccess(req, res, message, '/'))
        .catch(err=>showError(req, res, err, '/forgot-password'))
    })

    app.route('/reset-password/:randomValue')
    .get((req, res)=>{
        userService.verifyResetLink(req.params.randomValue)
        .then(()=>{
            res.sendFile(process.cwd() + '/views/reset-password.html');
        })
        .catch(err=>showError(req, res, err, ''))
    })
    .post((req, res)=>{
        userService.resetPassword({
            randomValue: req.params.randomValue,
            password: req.body.newPsw,
            confirmPassword: req.body.confirmNewPsw
        })
        .then(message=>showSuccess(req, res, message, '/login'))
        .catch(err=>showError(req, res, err, ''))
    })

    app.route('/manage')
    .get(auth.ensureAuthenticated, (req, res) => {
        res.sendFile(process.cwd() + '/views/manage.html');
    })
    app.route('/manage/unapproved')
    .post(auth.ensureAuthenticated, (req, res)=>{
        var userID = Object.getOwnPropertyNames(req.body)[0];
        userService.updateUnapproved({id: userID, order: req.body[userID]})
        .then(()=>{
            res.redirect('/manage');
        })
        .catch(err=>showError(req, res, err))
    })
    app.route('/manage/subordinates')
    .post(auth.ensureAuthenticated, (req, res)=>{
        var userID = Object.getOwnPropertyNames(req.body)[0];
        userService.del({id:userID, order: req.body[userID]})
        .then(()=>{
            res.redirect('/manage');
        })
        .catch(err=>showError(req, res, err))
    })

    app.route('/my-requests')
    .get(auth.ensureAuthenticated, (req, res) => {
        res.sendFile(process.cwd() + '/views/my-requests.html');
    })
    .post(auth.ensureAuthenticated, (req, res)=>{
        var requestID = Object.getOwnPropertyNames(req.body)[0];
        if(req.body[requestID] == "delete"){
            requestService.del(requestID)
            .then(()=>res.redirect('/my-requests'))
        }
    })

    app.route('/new-request')
    .get(auth.ensureAuthenticated, (req, res) => {
        res.sendFile(process.cwd() + '/views/new-request.html');
    })
    .post(auth.ensureAuthenticated, (req, res) => {
        requestService.saveRequest(req.body, req.user)
        .then((message) => {
            res.status(200).json({redirectLink: '/my-requests', message: "Requested message submitted successfully"});
        })
        .catch(err=>{
            console.log(err)
            res.status(406).json({error: err})
        })
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
        var redirect = false;
        var redirectLink = req.flash('redirect')[0];
        if(redirectLink != ""){
            redirect = true
        }
        res.render(process.cwd() + '/views/pug/success.pug', {
            message: req.flash('success')[0],
            redirect: redirect,
            redirectLink: redirectLink,
            redirectPageName: routeName[redirectLink]
        })
    })
    app.route('/failure')
    .get((req, res) => {
        var redirectLink = req.flash('redirect')[0];
        res.status(400).render(process.cwd() + '/views/pug/failure.pug', {
            err: req.flash('error')[0],
            redirectLink: redirectLink,
            redirectPageName: routeName[redirectLink]
        });
    })

    app.route('/altFailure')
    .get((req, res)=>{
        res.status(401).json({error: req.flash('error')[0]})
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