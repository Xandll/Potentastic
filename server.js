// server.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hallo Welt!');
});

module.exports = app;
