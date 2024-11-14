const express = require('express');
const path = require('path');
const app = express();

//const externalUrl = process.env.RENDER_EXTERNAL_URL;
//const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//if (externalUrl) {
//    const hostname = '0.0.0.0'; //ne 127.0.0.1
//    app.listen(port, hostname, () => {
//    console.log(`Server locally running at http://${hostname}:${port}/ and from
//    outside on ${externalUrl}`);
//    });
//  }
//  else {
//    https.createServer({
//    key: fs.readFileSync('server.key'),
//    cert: fs.readFileSync('server.cert')
//    }, app)
//    .listen(port, function () {
//    console.log(`Server running at https://localhost:${port}/`);
//    });
//  }

app.listen(3000, () => {
});