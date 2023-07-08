import { RawData, WebSocket, WebSocketServer } from 'ws';
import { RegData, REQUEST_TYPES, User } from '../types';
import { roomDataBase, userDataBase } from '../db';
import { findUser } from '../helpers/findUser';
import { sendAnswer } from '../helpers/sendAnswer';
import { randomUUID } from 'crypto';

const WS_PORT = 3000;

const wss = new WebSocketServer({port: WS_PORT});
const clients = new Map();

wss.on('connection',  (ws: WebSocket) => {
    const id = randomUUID();
    const metadata = { id };
    clients.set(ws, metadata);

    ws.on('message', (receivedMsg: RawData) => {
        console.log('received: %s', receivedMsg);
        const parsedData = JSON.parse(receivedMsg.toString());
        const clientId = clients.get(ws);
        const {type, data, id} = parsedData;
        switch (type) {
            case REQUEST_TYPES.REG:
                const newUser:User = JSON.parse(data);
                const isUserExist = !!findUser(userDataBase, newUser.name);
                if (!isUserExist) {
                    newUser.clientId = clientId;
                    userDataBase.push(newUser);
                    //remove console.log
                    console.log('userDataBase', userDataBase);
                    const regData = {
                        name: newUser.name,
                        index: userDataBase.indexOf(newUser),
                        error: false,
                        errorText: ''
                    };
                    sendAnswer(type, regData, ws, id);
                } else {
                    const regData:RegData = {
                        name: '',
                        index: -1,
                        error: true,
                        errorText: 'User with such name already exists'
                    };
                    sendAnswer(type, regData, ws, id);
                }
                break;
            case REQUEST_TYPES.CREATE_ROOM:
                const player:User | undefined = userDataBase.find((user) => user.clientId === clientId);
                if (!player) return;
                const roomInfo =  {
                        roomId: roomDataBase.length,
                        roomUsers: [
                            {
                                name: player.name,
                                index: userDataBase.indexOf(player),
                            },
                        ]
                    };
                const isRoomExist = !!roomDataBase.find((room) => findUser(room.roomUsers, player.name));
                if (isRoomExist) return;
                roomDataBase.push(roomInfo);
                [...clients.keys()].forEach((client) => {
                    sendAnswer(REQUEST_TYPES.UPDATE_ROOM, roomDataBase, client, id);
                });

                break;
        }
    });

    ws.send(`WebSocketServer started on: ws://localhost:${WS_PORT}`);
});
