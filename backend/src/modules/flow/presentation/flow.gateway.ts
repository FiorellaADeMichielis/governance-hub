import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class FlowGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`[WebSockets] Dashboard conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSockets] Dashboard desconectado: ${client.id}`);
  }

  notifyFlowUpdate() {
    this.server.emit('flow_updated', { trigger: 'refresh' });
  }
}