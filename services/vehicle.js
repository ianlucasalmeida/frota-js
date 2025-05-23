const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/frota.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const frotaProto = protoDescriptor.frota;

const client = new frotaProto.FrotaService('localhost:50051', grpc.credentials.createInsecure());

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function simulateVehicle(id) {
  let lat = getRandom(-90, 90);
  let lon = getRandom(-180, 180);

  const call = client.Track((error, response) => {
    if (error) console.error(error);
    else console.log(`Comando recebido por ${id}:`, response.message);
  });

  setInterval(() => {
    lat += getRandom(-0.001, 0.001);
    lon += getRandom(-0.001, 0.001);
    const speed = Math.floor(getRandom(30, 100));
    const status = speed > 50 ? "moving" : "slow";

    const update = {
      id,
      latitude: lat,
      longitude: lon,
      speed,
      status
    };

    console.log(`[Veículo ${id}] Enviando posição:`, update);
    call.write(update);
  }, 3000);
}

simulateVehicle("VEICULO_01");
simulateVehicle("VEICULO_02");