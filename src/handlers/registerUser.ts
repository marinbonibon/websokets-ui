import { ClientId, RegData, RESPONSE_TYPES, User } from '../types';
import { findUser } from '../helpers/findUser';
import { roomDataBase, userDataBase } from '../db';
import { sendAnswer } from '../helpers/sendAnswer';
import { WebSocket } from 'ws';

export const registerUser = (data: string, clientId: ClientId, ws: WebSocket, id: number, clients: Map<WebSocket, string>) => {
  const newUser: User = JSON.parse(data);
  const isUserExist = !!findUser(userDataBase, newUser.name);
  if (!isUserExist) {
    newUser.clientId = clientId;
    userDataBase.push(newUser);
    const regData = {
      name: newUser.name,
      index: userDataBase.indexOf(newUser),
      error: false,
      errorText: ''
    };
    sendAnswer(RESPONSE_TYPES.REG, regData, ws, id);
    roomDataBase.length && [...clients.keys()].forEach((client) => {
      sendAnswer(RESPONSE_TYPES.UPDATE_ROOM, roomDataBase, client, id);
    });
  } else {
    const regData: RegData = {
      name: '',
      index: -1,
      error: true,
      errorText: 'User with such name already exists'
    };
    sendAnswer(RESPONSE_TYPES.REG, regData, ws, id);
  }
}
