const socket = io();
const chatForm = document.getElementById("chatform");
const joinForm = document.getElementById("joinbox");
const status = document.getElementById("status");
const userList = document.getElementById("userlist");
const chatText = document.getElementById("chattext");

function redStatus(txt) {
  status.innerText = txt
  status.style.color = "red"
}

function greenStatus(txt) {
  status.innerText = txt
  status.style.color = "green"
}

function noStatus() {
  status.innerText = ''
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

socket.on("connect", () => {
  console.log(socket.connected); // true
  joinForm.style.display = "initial";
  noStatus()
});
joinForm.addEventListener('submit', function(e) {
  e.preventDefault();
  noStatus()
  let nameInput = joinForm.childNodes[3].value;
  let invistest = nameInput.replace(/\s/g, '');
  if (invistest === "") {
    redStatus("No Name Detected")
    return
  };
  joinForm.style.display = "none";
  greenStatus("Joining....");
  socket.emit('login', nameInput);
  noStatus()
  chatForm.style.display = "initial";
  socket.on('userRemove', (name) => {
    console.log("Dropping user: "+name);
    userList.childNodes.forEach((item, index) => {
      if (item.data === name) {
        userList.removeChild(userList.childNodes[index + 1]); 
        userList.removeChild(userList.childNodes[index]);
        chatText.innerHTML += "<br>Server: "+name+" Left the channel";
      };
    });
  });
  socket.on('userList', (args) => {
    removeAllChildNodes(userList);
    for (const [key, value] of Object.entries(args['users'])) { //For every entry in table add to users list
      userList.innerText += value
      userList.innerHTML += "<br>"
    };
    chatText.innerHTML += "<br>Server: "+args['name']+" Joined the channel";
  });
  socket.on('messageRecived', (msg) => {
      chatText.innerHTML += "<br>"
      chatText.innerText += msg
  });
});
socket.on('disconnect', function() {
  chatForm.style.display = "none";
  joinForm.style.display = "none";
  redStatus("Server disconnect")
  removeAllChildNodes(userList);
  removeAllChildNodes(chatText);
});
