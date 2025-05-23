const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/frota.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const frotaProto = protoDescriptor.frota;

const vehicles = {};

function track(call, callback) {
  call.on('data', (update) => {
    console.log(`[Tracking] Veículo ${update.id} atualizado:`, update);
    vehicles[update.id] = update;
    const command = new frotaProto.Command();
    command.message = 'continue';
    call.write(command);
  });

  call.on('end', () => {
    callback(null, {});
  });
}

function estimateDelivery(call, callback) {
  const { vehicle_id, destination_lat, destination_lon } = call.request;
  const vehicle = vehicles[vehicle_id];
  if (!vehicle) {
    return callback(new Error("Veículo não encontrado"));
  }

  // Simulando cálculo simples com distância fictícia
  const distance = Math.sqrt(
    Math.pow(destination_lat - vehicle.latitude, 2) +
    Math.pow(destination_lon - vehicle.longitude, 2)
  );
  const speedKmH = vehicle.speed || 60;
  const timeHours = (distance * 100) / speedKmH;
  const estimatedTime = `${Math.round(timeHours * 60)} minutos`;

  const response = new frotaProto.EstimateResponse();
  response.estimated_time = estimatedTime;
  callback(null, response);
}

const server = new grpc.Server();
server.addService(frotaProto.FrotaService.service, {
  Track: track,
  EstimateDelivery: estimateDelivery
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Servidor gRPC rodando na porta 50051');
});