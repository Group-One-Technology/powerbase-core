const path = require('path');
const express = require('express');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.sendFile('index.html', {
    root: path.join(__dirname, '../public'),
  });
});

app.listen(8080, () => {
  console.log('App is running at localhost:8080');
});
