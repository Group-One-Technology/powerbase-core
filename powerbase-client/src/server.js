const path = require('path');
const express = require('express');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.API);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
});

app.get('*', (req, res) => {
  res.sendFile('index.html', {
    root: path.join(__dirname, '../public'),
  });
});

app.listen(8080, () => {
  console.log('App is running at localhost:8080');
});
