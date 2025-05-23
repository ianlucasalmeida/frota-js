const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Cliente conectado');
  socket.on('mouseMove', (data) => {
    console.log('[LOG] Posição do veículo:', data);
    io.emit('log', `[LOG] Veículo ${data.id}: Lat ${data.lat}, Lon ${data.lon}`);
  });
});

server.listen(3000, () => {
  console.log('Servidor HTTP rodando na porta 3000');
});