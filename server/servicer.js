const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let shapes = [];
let users = [];

let locks = {};

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    switch (msg.action) {
      case 'lock':
        if (!locks[msg.data.shapeId]) {
          locks[msg.data.shapeId] = msg.data.userId;
          broadcastToAll({ action: 'lock', data: { shapeId: msg.data.shapeId, userId: msg.data.userId } });
        }
        break;
      case 'unlock':
        if (locks[msg.data.shapeId] === msg.data.userId) {
          delete locks[msg.data.shapeId];
          broadcastToAll({ action: 'unlock', data: { shapeId: msg.data.shapeId,userId: msg.data.userId } });
        }
        break;
      case 'updateShape':
        const shapeIndex = shapes.findIndex((s) => s.id === msg.data.id);
        if (shapeIndex !== -1) {
          shapes[shapeIndex] = msg.data;
          broadcastToOther({ action: 'updateShape', data: msg.data },ws);
        }
        break;
      case 'addShape':
          shapes.push(msg.data);
          broadcastToOther({ action: 'addShape', data: msg.data },ws);
        break;
      case 'mouseMove':
          shapes.push(msg.data);
          broadcastToOther({ action: 'mouseMove', data: msg.data },ws);
        break;
      case 'resetServer':
        shapes=[];
        locks={};
        users=[];
          broadcastToAll({ action: 'resetServer'});
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected', ws.userId);
    // Release locks held by this user
    Object.keys(locks).forEach((shapeId) => {
      if (locks[shapeId] === ws.userId) {
        delete locks[shapeId];
      }
    });
  });

  // Send initial state to the new client
  ws.send(JSON.stringify({ action: 'initialStateUpdate', data: { shapes } }));
});

function broadcastToOther(message,ws) {
  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
function broadcastToAll(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

console.log('WebSocket server started on ws://localhost:8080');
