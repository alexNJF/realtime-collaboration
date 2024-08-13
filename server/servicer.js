const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let shapes = [];
let users = [];

wss.on('connection', (ws) => {
  
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    switch (msg.action) {
      case 'memberChange':
        users.push(msg.data.userId);
        ws['userId']=msg.data.userId
        console.log('Client join',msg.data.userId);
        broadcastToAll({ action: 'memberChange', data: { users:users } });
        break;

      case 'lock':
          const lockeShapeIndex = shapes.findIndex((s) => s.id === msg.data.shapeId);
          if (lockeShapeIndex !== -1) {
            shapes[lockeShapeIndex].lockedBy=msg.data.userId           
          broadcastToAll({ action: 'lock', data: { shapeId: msg.data.shapeId, userId: msg.data.userId } });
          }
        break;
      case 'unlock':
          const unlockShapeIndex = shapes.findIndex((s) => s.id === msg.data.shapeId);
          if (unlockShapeIndex !== -1) {
            shapes[unlockShapeIndex].lockedBy=undefined       
          broadcastToAll({ action: 'unlock', data: { shapeId: msg.data.shapeId,userId: msg.data.userId } });
        }
        break;

      case 'updateShape':
        const shapeIndex = shapes.findIndex((s) => s.id === msg.data.shapeId);
        if (shapeIndex !== -1) {
          shapes[shapeIndex] ={
            ...shapes[shapeIndex],
            ...msg.data.changes
          };
          broadcastToOther({ action: 'updateShape', data: msg.data },ws);
        }
        break;

      case 'addShape':
          shapes.push(msg.data);
          broadcastToOther({ action: 'addShape', data: msg.data },ws);
        break;
      case 'mouseMove':
          broadcastToOther({ action: 'mouseMove', data: msg.data },ws);
        break;
      case 'resetServer':
        shapes=[];
        users=[];
          broadcastToAll({ action: 'resetServer'});
        break;

        case 'broadCast':
          broadcastToAll({ action: 'broadCast', data: msg.data },ws);
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected', ws.userId);
    
    users=users.filter(user=>user !==ws.userId)
    broadcastToAll({ action: 'memberChange', data: { users:users } });

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
