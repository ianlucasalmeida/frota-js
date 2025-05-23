# **🚛 Projeto Frota JS – Sistema de Gestão de Frota com gRPC**

Sistema distribuído simulando a gestão de frota veicular de uma empresa de logística, utilizando **gRPC** para comunicação eficiente entre os veículos e o centro de rastreamento central.

O objetivo é demonstrar como o uso de **streaming bidirecional** , chamadas unárias e contratos bem definidos tornam o sistema mais eficiente, resiliente e escalável.

---

## **🧩 Funcionalidades Implementadas**

*   ✅ Comunicação **bidirecional em tempo real** entre veículo e central (gRPC Streaming)
*   ✅ Chamada **unária para estimativa de entrega**
*   ✅ Simulação de múltiplos veículos com atualização contínua de posição
*   ✅ Interface web com:
    *   Tela de tráfego (com movimento do mouse representando o veículo)
    *   Tela de logs em tempo real
    *   Tela de estimativa de tempo até destino
*   ✅ Logs detalhados no terminal
*   ✅ Suporte a múltiplos veículos com IDs únicos

---

## **🏗️ Arquitetura do Projeto**

### **Estrutura Geral**

frota-js/  
├── proto/  
│   └── frota.proto         # Definição dos serviços gRPC  
├── services/  
│   ├── tracking.js         # Serviço central de rastreamento (gRPC Server)  
│   ├── estimation.js       # Serviço de estimativa de entrega (gRPC Server)  
│   └── vehicle.js          # Cliente gRPC de simulação de veículo  
├── public/  
│   ├── index.html          # Página inicial com links  
│   ├── map.html            # Simula veículos com movimento do mouse  
│   ├── logs.html           # Exibe logs em tempo real  
│   └── estimate.html       # Consulta unária de tempo de chegada ao destino  
├── app.js                  # Servidor Express + WebSocket (para interface web)  
└── README.md               # Este arquivo

---

## **📐 Diagrama de Arquitetura (Mermaid)**

graph TD  
   A\[Veículo 1\] --> B\[(gRPC Streaming)\]  
   C\[Veículo 2\] --> B  
   D\[Sistema Central\] -->|Comandos| A & C  
   E\[Interface Web\] --> F\[Servidor Express\]  
   F --> G\[gRPC Unário: EstimateDelivery\]  
   G --> D  
   F \<--> H\[(WebSocket)\] -->|Logs em Tempo Real| E  
   D --> H

---

## **🚗 Componentes do Sistema**

### **1\. Serviço de Veículo (vehicle.js) – gRPC Client**

Representa cada veículo da frota. Ele:

*   Conecta-se ao servidor central via **streaming bidirecional**
*   Envia periodicamente:
    *   Localização (latitude/longitude)
    *   Velocidade
    *   Status ("moving", "stopped")
*   Recebe comandos em tempo real da central

> Também é possível simular veículos através do mouse na tela **map.html**.

---

### **2\. Serviço Central de Rastreamento (tracking.js) – gRPC Server**

É o coração do sistema. Ele:

*   Recebe dados dos veículos em tempo real
*   Armazena as últimas informações de cada veículo
*   Retorna comandos aos veículos (ex: alertas)
*   Oferece o serviço de estimativa de entrega

---

### **3\. Serviço de Estimativa de Entrega (estimation.js) – gRPC Server (Unário)**

Esse serviço recebe uma requisição simples com:

*   ID do veículo
*   Coordenadas do destino

E retorna:

*   Tempo estimado de chegada
*   Motivos para possíveis atrasos (trânsito, clima etc.)

Essa chamada é feita a partir da página web **estimate.html**.

---

### **4\. Interface Web (public/, app.js)**

Fornece uma interface amigável para visualizar e interagir com o sistema:

#### **a) map.html – Simulação de Tráfego**

*   Permite ao usuário digitar o ID do veículo
*   Movimento do mouse simula localização do carro
*   Atualizações são enviadas via WebSocket para o backend

#### **b) logs.html – Logs em Tempo Real**

*   Mostra todas as atualizações dos veículos
*   Exibe comandos recebidos pela central

#### **c) estimate.html – Estimativa de Entrega**

*   O usuário informa:
    *   ID do veículo
    *   Latitude e longitude do destino
*   Chama o serviço gRPC unário **EstimateDelivery**
*   Mostra o tempo estimado de chegada

---

## **📦 Contrato de Comunicação – proto/frota.proto**

Definição das interfaces e mensagens usadas pelo sistema:

syntax = "proto3";

package frota;

service FrotaService {  
 rpc Track(stream VehicleUpdate) returns (stream Command) {}  
 rpc EstimateDelivery(EstimateRequest) returns (EstimateResponse) {}  
}

message VehicleUpdate {  
 string id = 1;  
 double latitude = 2;  
 double longitude = 3;  
 int32 speed = 4;  
 string status = 5;  
}

message Command {  
 string message = 1;  
}

message EstimateRequest {  
 string vehicle\_id = 1;  
 double destination\_lat = 2;  
 double destination\_lon = 3;  
}

message EstimateResponse {  
 string estimated\_time = 1;  
 string reasons = 2;  
}

---

## **🚀 Como Executar o Projeto**

### **Passo 1: Instale as dependências**

bash

1

npm install express grpc @grpc/proto-loader socket.io

### **Passo 2: Inicie o servidor central**

bash

1

node services/tracking.js

### **Passo 3: (Opcional) Inicie o serviço de estimativa**

bash

1

node services/estimation.js

### **Passo 4: Inicie o servidor web**

bash

1

node app.js

### **Passo 5: Acesse no navegador**

🔗 [http://localhost:3000](http://localhost:3000/)

---

## **💡 Justificativa do Uso de gRPC**

O uso de **gRPC** neste projeto se mostrou essencial por atender diretamente aos requisitos funcionais e não funcionais do problema. Vamos analisar:

| **Requisito** | **Por que gRPC é adequado** |
| --- | --- |
| **Streaming bidirecional** | gRPC permite conexões persistentes para troca contínua de mensagens, ideal para veículos em movimento |
| **Eficiência de rede** | Protocol Buffer reduz o tamanho dos payloads — importante em redes móveis instáveis |
| **Contratos bem definidos** | **.proto**garante evolução controlada da API e interoperabilidade entre sistemas distintos |
| **Integração multiplataforma** | gRPC suporta múltiplas linguagens, permitindo fácil integração com outros módulos (em Java, Go, Python etc.) |