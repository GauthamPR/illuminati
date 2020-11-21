const auth = require('./auth.js');
const passport = require('passport');
module.exports = function (app) {
    app.get('/', (req, res) => {
        res.sendFile(process.cwd() + '/views/home.html');
    })
    app.route('/login')
        .get((req, res) => {
            res.sendFile(process.cwd() + '/views/login.html');
        })
        .post(passport.authenticate('local', { failureRedirect: '/my-requests' }), (req, res) => {
            res.cookie('User Name', req.user.name);
            res.cookie('Level', req.user.level);
            res.redirect('/');
        })

    app.route('/my-requests')
        .get(auth.ensureAuthenticated, (req, res) => {
            res.sendFile(process.cwd() + '/views/my-requests.html');
        })

    app.route('/new-request')
        .get(auth.ensureAuthenticated, (req, res) => {
            res.sendFile(process.cwd() + '/views/new-request.html');
        })

    app.route('/my-approvals')
        .get(auth.ensureAuthenticated, (req, res) => {
            res.sendFile(process.cwd() + '/views/my-approvals.html');
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