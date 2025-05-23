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
    console.log(`[Tracking] Veículo ${update.id} | Posição: (${update.latitude.toFixed(4)}, ${update.longitude.toFixed(4)}) | Velocidade: ${update.speed} km/h`);
    vehicles[update.id] = update;
    const command = new frotaProto.Command();
    command.message = 'continue';
    call.write(command);
  });

  call.on('end', () => {
    callback(null, {});
  });
}

const commands = [
  "ALERTA: Reduzir velocidade",
  "AVISO: Trânsito intenso à frente",
  "STATUS: Confirme sua rota"
];

function estimateDelivery(call, callback) {
  const request = call.request;
  const { vehicle_id, destination_lat, destination_lon } = request;
  const vehicle = vehicles[vehicle_id];

  if (!vehicle) {
    return callback(new Error("Veículo não encontrado"));
  }

  const trafficFactor = Math.random() * 0.5;
  const weatherImpact = Math.random() > 0.7 ? 0.2 : 0;

  const distanceDeg = Math.hypot(
    destination_lat - vehicle.latitude,
    destination_lon - vehicle.longitude
  );

  const distanceKm = distanceDeg * 111;
  const speedKmH = vehicle.speed || 60;

  let timeHours = distanceKm / speedKmH;
  timeHours *= (1 + trafficFactor + weatherImpact);

  const estimatedTime = `${Math.round(timeHours * 60)} minutos`;
  const delayReasons = [];

  if (trafficFactor > 0.3) delayReasons.push("trânsito intenso");
  if (weatherImpact > 0) delayReasons.push("chuva");

  const response = new frotaProto.EstimateResponse();
  response.estimated_time = estimatedTime;
  response.reasons = delayReasons.join(", ");

  console.log(`[Estimativa] ${vehicle_id} -> ${estimatedTime} (${response.reasons})`);
  callback(null, response);
}

const server = new grpc.Server();
server.addService(frotaProto.FrotaService.service, {
  Track: track,
  EstimateDelivery: estimateDelivery
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Servidor gRPC rodando na porta 50051');
  // server.start(); // Remova ou comente esta linha
});