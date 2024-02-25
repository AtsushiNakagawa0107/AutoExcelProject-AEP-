const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const opn = require('opn'); 

app.use(express.static(path.join(__dirname, 'public'))); // 'public' ディレクトリに静的ファイルを配置

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // 'index.html' は開きたいHTMLファイル
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  opn(`http://localhost:${port}`);
});

