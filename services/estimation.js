const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/frota.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const frotaProto = protoDescriptor.frota;

const server = new grpc.Server();
server.addService(frotaProto.FrotaService.service, {
  EstimateDelivery: (call, callback) => {
    const request = call.request;
    const vehicleId = request.vehicle_id;
    const vehicle = {
      id: vehicleId,
      latitude: -23.56,
      longitude: -46.62,
      speed: 60
    };

    const distanceDeg = Math.hypot(
      request.destination_lat - vehicle.latitude,
      request.destination_lon - vehicle.longitude
    );
    const timeMinutes = Math.round((distanceDeg * 111 / vehicle.speed) * 60);

    const response = new frotaProto.EstimateResponse();
    response.estimated_time = `${timeMinutes} minutos`;
    response.reasons = "";

    console.log(`[Estimativa] ${vehicleId} -> ${response.estimated_time}`);
    callback(null, response);
  }
});

server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Servidor de Estimativa rodando na porta 50052');
  // server.start(); // Remova ou comente esta linha
});