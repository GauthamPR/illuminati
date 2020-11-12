const express = require('express');
const connection = require('./connection.js');
require('dotenv').config();

const app = express();


app.use(express.static(__dirname + '/public'));

app.get('/', (req, res)=> {
    res.sendFile(process.cwd() + '/views/home.html');
})

app.get('/login', (req, res)=> {
    res.sendFile(process.cwd() + '/views/login.html');
})
app.listen(process.env.PORT || 3000, ()=> console.log('listening on Port', process.env.PORT));