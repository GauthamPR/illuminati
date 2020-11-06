const express = require('express');

const app = express();

app.use(express.static(__dirname + 'style.css'));

app.get('/', (req, res)=> {
    res.sendFile(process.cwd() + '/public/home/home.html');
})

app.get('/login', (req, res)=> {
    app.use(express.static(__dirname + '/public/login/login-style.css'));
    res.sendFile(process.cwd() + '/public/login/login.html');
})
app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port 3000'));