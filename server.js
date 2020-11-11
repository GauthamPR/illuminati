const express = require('express');
const connection = require('./connection.js');
require('dotenv').config();

const app = express();

connection();

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res)=> {
    res.sendFile(process.cwd() + '/public/home/home.html');
})

app.get('/login', (req, res)=> {
    app.use(express.static(__dirname + '/public/login'));
    res.sendFile(process.cwd() + '/public/login/login.html');
})
app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));