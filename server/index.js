const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
const users = {};

wss.on("connection", (ws) => {
  // ... other message handling and disconnection handling
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.op === "usernameAdd") {
      users[data.username] = {ws, cordination: {} };
      broadcastUserList();
    }

    if (data.op === "mouseMove") {
      users[data.username] = {ws,cordination: data.cordination };
    }
    // Process data and broadcast to other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(users));
      }
    });
  });
  ws.on("close", (code,reson) => {
    Object.keys(users).forEach(item=>{
      if(users[item].ws===ws){
        delete users[item]
        console.log("disconnected",item);
        broadcastUserList();
      }
    })
  });
});

function broadcastUserList() {
  const userList = users; // Or include other user information
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(users));
    }
  });
}
