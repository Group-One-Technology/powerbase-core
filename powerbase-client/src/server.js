const path = require('path');
const express = require('express');

const PORT = process.env.PORT ?? 4000;

const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.sendFile('index.html', {
    root: path.join(__dirname, '../public'),
  });
});

app.listen(PORT, () => {
  console.log(`App is running at localhost:${PORT}`);
});
