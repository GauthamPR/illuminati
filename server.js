const express = require('express');
const connection = require('./connection.js');
require('dotenv').config();

const app = express();

connection();

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res)=> {
    app.use(express.static(__dirname+'/views/home'));
    res.sendFile(process.cwd() + '/views/home/home.html');
})

app.get('/login', (req, res)=> {
    app.use(express.static(__dirname + '/public/login'));
    res.sendFile(process.cwd() + '/views/login/login.html');
})
app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));