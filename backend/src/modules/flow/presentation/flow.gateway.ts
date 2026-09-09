import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Habilita CORS para que React (que corre en otro puerto) pueda conectarse sin bloqueos
@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class FlowGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 [WebSockets] Dashboard conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 [WebSockets] Dashboard desconectado: ${client.id}`);
  }

  // se llama cuando guardemos un flujo nuevo
  notifyFlowUpdate() {
    // Emite el evento 'flow_updated' a todos los clientes conectados
    this.server.emit('flow_updated', { trigger: 'refresh' });
  }
}