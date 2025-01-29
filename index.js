var express = require('express'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    webSocket = require('ws');

var app = express(),
    server = http.createServer(app),
    wss = new webSocket.Server({ server: server });

var connects = []


app.use(express.static(path.join(__dirname, '/public')));

// Called when success building connection
wss.on('connection', function (ws, req) {
    var location = url.parse(req.url, true);

    var initMessage = { message: "connection" };
    ws.send(JSON.stringify(initMessage));
    connects.push(ws);
    console.log("New Client Connected : " + connects.length);
});

server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});