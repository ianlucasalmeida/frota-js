const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/frota.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const frotaProto = protoDescriptor.frota;

const client = new frotaProto.FrotaService('localhost:50051', grpc.credentials.createInsecure());

const call = client.Track((error, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log("Comando recebido:", response.message);
  }
});

call.on('data', (command) => {
  console.log("Comando recebido:", command.message);
});

function sendVehicleUpdate(update) {
  call.write(update);
}

window.sendVehicleUpdate = sendVehicleUpdate;