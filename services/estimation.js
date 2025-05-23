const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/frota.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const frotaProto = protoDescriptor.frota;

// Servidor gRPC para estimativas
const server = new grpc.Server();

server.addService(frotaProto.FrotaService.service, {
  EstimateDelivery: (call, callback) => {
    const request = call.request;
    const vehicleId = request.vehicle_id;

    // Aqui você pode usar dados reais do veiculo armazenados
    // Neste exemplo vai ter valores fictícios
    const distance = Math.sqrt(
      Math.pow(request.destination_lat - (-23.56), 2) +
      Math.pow(request.destination_lon - (-46.62), 2)
    );

    const speedKmH = 60;
    const timeMinutes = Math.round((distance * 100 / speedKmH) * 60);

    const response = {
      estimated_time: `${timeMinutes} minutos`
    };

    console.log(`[Estimativa] ${vehicleId} -> ${response.estimated_time}`);
    callback(null, response);
  }
});

server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Servidor de Estimativa rodando na porta 50052');
  // server.start(); // Remova ou comente esta linha
});