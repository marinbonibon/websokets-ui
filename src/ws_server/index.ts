import { RawData, WebSocket, WebSocketServer } from 'ws';
import { AddShipsData, PlayersData, REQUEST_TYPES, User } from '../types';
import { roomDataBase, userDataBase } from '../db';
import { randomUUID } from 'crypto';
import { registerUser } from '../handlers/registerUser';
import { createRoom } from '../handlers/createRoom';
import { addUserToRoom } from '../handlers/addUserToRoom';
import { startGame } from '../handlers/startGame';

const WS_PORT = 3000;

const wss = new WebSocketServer({port: WS_PORT});
const clients = new Map();
const gameClients = new Map();
const roomCreators = new Map();
let playersData: Array<PlayersData> = [];

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
                registerUser(data, clientId, ws, id, clients);
                break;
            case REQUEST_TYPES.CREATE_ROOM:
                createRoom(player, roomCreators, metadata, ws, clients, id);
                break;
            case REQUEST_TYPES.ADD_USER_TO_ROOM:
                const args = {
                    data,
                    player,
                    roomCreators,
                    gameClients,
                    metadata,
                    ws,
                    id,
                    clients
                }
                addUserToRoom(args);
                break;
            case REQUEST_TYPES.ADD_SHIPS:
                const playersAmount = 2;
                const parsedMsg = JSON.parse(receivedMsg.toString());
                const parsedData: AddShipsData = JSON.parse(parsedMsg.data);
                playersData.push({
                    ships: parsedData.ships,
                    indexPlayer: parsedData.indexPlayer,
                    ws
                });
                if (playersData.length !== playersAmount) return;
                startGame(playersData, id);
                playersData = [];
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
