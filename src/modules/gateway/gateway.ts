import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { TokenService } from 'src/common/service/token.service';
import {
  connectedUsers,
  RoleTypes,
  UserDocument,
} from 'src/DB/model/User.model';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Types } from 'mongoose';

export interface IAuthSocket extends Socket {
  user: UserDocument;
}
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealTimeGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private tokenService: TokenService) {}
  @WebSocketServer()
  server: Server;

  afterInit(_server: Server) {
    console.log('chat started');
  }
  destructAuthorization(client: Socket): string {
    return (
      client.handshake.auth?.authorization ||
      client.handshake.headers?.authorization
    );
  }
  async handleConnection(client: Socket) {
    try {
      const authorization = this.destructAuthorization(client);
      console.log({ authorization });
      const user = await this.tokenService.verify({ authorization });
      console.log({ user });
      client['user'] = user;
      connectedUsers.set(user._id.toString(), client.id);
      console.log({ connectedUsers });
    } catch (error) {
      client.emit('exception', error.message || 'fail to connect');
    }
  }
  handleDisconnect(client: IAuthSocket) {
    console.log({ C: client['user'] });
    connectedUsers.delete(client.user._id.toString());
    console.log({ connectedUsers });

    console.log('Client disconnected:', client.id);
  }
  @Auth(RoleTypes.admin)
  @SubscribeMessage('sayHi')
  sayHi(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    try {
      console.log({ body });
      console.log({ client });
      this.server.emit('sayHi', 'lol');
      client.emit('sayHi', 'hola');
    } catch (error) {
      client.emit('exception', error.message || 'fail ');
    }
  }

  emitStockChanges(
    data:
      | { productId: Types.ObjectId; stock: number }
      | { productId: Types.ObjectId; stock: number }[],
  ) {
    try {
      this.server.emit('emitStockChanges', data);
    } catch (error) {
      this.server.emit('exception', error.message || 'fail ');
    }
  }
}
