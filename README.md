# Projeto Frota JS

Sistema distribuído de monitoramento de frota veicular com comunicação gRPC.

## Tecnologias

- Node.js
- Express.js
- gRPC
- WebSocket
- HTML/CSS/JS puro

## Funcionalidades

- Streaming bidirecional entre veículos e central
- Estimativa de tempo de entrega (chamada unária)
- Simulação de movimento pelo mouse na tela de tráfego
- Logs em tempo real

## Como Executar

1. Instale as dependências:
   ```bash
   npm install express grpc @grpc/proto-loader socket.io