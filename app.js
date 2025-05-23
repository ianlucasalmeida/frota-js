const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

// Rota para estimativa
app.post('/api/estimate', async (req, res) => {
  const { id, lat, lon } = req.body;
  const proto = require('./proto/frota_grpc_pb');
  const client = new proto.FrotaServiceClient('http://localhost:50051', null, null);

  const request = new proto.EstimateRequest();
  request.setVehicleId(id);
  request.setDestinationLat(lat);
  request.setDestinationLon(lon);

  client.estimateDelivery(request, {}, (err, response) => {
    if (err) return res.status(500).send(err);
    res.json({ time: response.getEstimatedTime() });
  });
});

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