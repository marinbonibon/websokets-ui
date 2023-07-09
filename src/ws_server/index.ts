import { RawData, WebSocket, WebSocketServer } from 'ws';
import { CreateGameData, RegData, REQUEST_TYPES, RESPONSE_TYPES, UpdateRoomData, User, UserInfo } from '../types';
import { roomDataBase, userDataBase } from '../db';
import { findUser } from '../helpers/findUser';
import { sendAnswer } from '../helpers/sendAnswer';
import { randomUUID } from 'crypto';

const WS_PORT = 3000;

const wss = new WebSocketServer({port: WS_PORT});
const clients = new Map();
const gameClients = new Map();
const roomCreators = new Map();

wss.on('connection', (ws: WebSocket) => {
    const id = randomUUID();
    const metadata = {id};
    clients.set(ws, metadata);

    ws.on('message', (receivedMsg: RawData) => {
        console.log('received: %s', receivedMsg);
        const parsedData = JSON.parse(receivedMsg.toString());
        const clientId = clients.get(ws);
        const player: User | undefined = userDataBase.find((user: User) => user.clientId === clientId);
        const {type, data, id} = parsedData;
        switch (type) {
            case REQUEST_TYPES.REG:
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
                    sendAnswer(type, regData, ws, id);
                }
                break;
            case REQUEST_TYPES.CREATE_ROOM:
                if (!player) return;
                const roomInfo = {
                    roomId: roomDataBase.length,
                    roomUsers: [
                        {
                            name: player.name,
                            index: userDataBase.indexOf(player),
                        },
                    ]
                };
                const isRoomExist = !!roomDataBase.find((room: UpdateRoomData) => findUser(room.roomUsers, player.name));
                if (isRoomExist) return;
                roomDataBase.push(roomInfo);
                roomCreators.set(metadata.id, ws);
                [...clients.keys()].forEach((client) => {
                    sendAnswer(RESPONSE_TYPES.UPDATE_ROOM, roomDataBase, client, id);
                });
                break;
            case REQUEST_TYPES.ADD_USER_TO_ROOM:
                const playersAmount = 2;
                const parsedData = JSON.parse(data.toString());
                const {indexRoom} = parsedData;
                const room = roomDataBase.find((r: UpdateRoomData) => r.roomId === indexRoom);
                if (!player) return;
                const secondPlayer: UserInfo = {
                    name: player.name,
                    index: userDataBase.indexOf(player)
                };
                if (!room) return;
                const [firstPlayer] = room.roomUsers;
                if (!firstPlayer) return;
                const idGame = firstPlayer.index;
                const idPlayer = userDataBase.indexOf(player);
                if (idGame === idPlayer) return;
                if (room.roomUsers.length < playersAmount) {
                    room.roomUsers.push(secondPlayer);
                }
                const createGameData: CreateGameData = {
                    idGame,
                    idPlayer,
                };
                // create map for 2 players and send them create game
                const host = userDataBase[firstPlayer.index];
                const hostId = [...roomCreators.keys()].find((clientId) => clientId === host?.clientId?.id);
                const hostClient = roomCreators.get(hostId);
                gameClients.set(hostId, hostClient);
                roomCreators.delete(hostId);
                gameClients.size < playersAmount && gameClients.set(metadata.id, ws);
                [...gameClients.values()].forEach((client) => {
                    sendAnswer(RESPONSE_TYPES.CREATE_GAME, createGameData, client, id);
                });
                roomDataBase.splice(indexRoom, 1);
                gameClients.clear();
                [...clients.keys()].forEach((client) => {
                    sendAnswer(RESPONSE_TYPES.UPDATE_ROOM, roomDataBase, client, id);
                });
                break;
        }
    });

    ws.send(`WebSocketServer started on: ws://localhost:${WS_PORT}`);

    ws.on('close', () => {
        const clientId = clients.get(ws);
        const userIndex: number = userDataBase.findIndex((user: User) => user.clientId === clientId);
        userDataBase.splice(userIndex, 1);
        const room = roomDataBase.find((r) => r.roomUsers[0]?.index === userIndex || r.roomUsers[1]?.index === userIndex);
        room && roomDataBase.splice(roomDataBase.indexOf(room), 1);
        clients.delete(ws);
    });
});
