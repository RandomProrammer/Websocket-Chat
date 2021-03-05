const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
var router = express.Router();
const httpserver = http.Server(app);
const io = socketio(httpserver);

var path = __dirname + '/views/';

var usernames = {} //List of users using the service

app.use('/public', express.static(__dirname + '/public'));

httpserver.listen(3000);

router.get("/", function(req, res) {
  res.sendFile(path + "index.html");
});
app.use("/", router);

io.on('connection', (socket) => { //When user connects
  console.log('a user connected');
  socket.on('login', (name) => { //When user logs in
    console.log('User picked name: ' + name);
    usernames[socket.id] = name; //Store User
    io.sockets.emit('userList', {
      users: usernames,
      name: name
    });
  });
  socket.on('disconnect', () => { //When user stops connecting
    let name = usernames[socket.id];
    if (name) {
      console.log(name + ' disconnected');
      io.sockets.emit('userRemove', name);
      delete usernames[socket.id];
    } else {
      console.log("user disconnected")
    };

  });
  socket.on('sendMsg', (msg) => {
    let name = usernames[socket.id];
    if (name) {
      console.log(name + ' sent a message');
      io.sockets.emit('messageRecived', `${name}: ${msg}`);
    } else {
      console.log("No Name for client")
    };

  });
});
