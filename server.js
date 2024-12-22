// filepath: /server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let onlineUsers = [];

wss.on('connection', function connection(ws) {
  onlineUsers.push(ws);
  broadcastOnlineUsers();

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);
    if (data.type === 'message') {
      broadcastMessage(data);
    } else if (data.type === 'typing') {
      broadcastTyping(data.user);
    } else if (data.type === 'stop_typing') {
      broadcastStopTyping(data.user);
    } else if (data.type === 'private_message') {
      sendPrivateMessage(data);
    } else if (data.type === 'file') {
      broadcastFile(data);
    }
  });

  ws.on('close', function close() {
    onlineUsers = onlineUsers.filter(user => user !== ws);
    broadcastOnlineUsers();
  });
});

function broadcastMessage(data) {
  onlineUsers.forEach(user => {
    user.send(JSON.stringify({
      type: 'message',
      user: data.user,
      message: data.message,
      messageId: data.messageId,
      avatar: data.avatar
    }));
  });
}

function broadcastTyping(user) {
  onlineUsers.forEach(client => {
    client.send(JSON.stringify({ type: 'typing', user: user }));
  });
}

function broadcastStopTyping(user) {
  onlineUsers.forEach(client => {
    client.send(JSON.stringify({ type: 'stop_typing', user: user }));
  });
}

function sendPrivateMessage(data) {
  onlineUsers.forEach(client => {
    if (client.username === data.recipient) {
      client.send(JSON.stringify({
        type: 'private_message',
        user: data.user,
        message: data.message,
        avatar: data.avatar
      }));
    }
  });
}

function broadcastFile(data) {
  onlineUsers.forEach(user => {
    user.send(JSON.stringify({
      type: 'file',
      user: data.user,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      avatar: data.avatar
    }));
  });
}

function broadcastOnlineUsers() {
  const count = onlineUsers.length;
  onlineUsers.forEach(client => {
    client.send(JSON.stringify({ type: 'online_users', count: count }));
  });
}
