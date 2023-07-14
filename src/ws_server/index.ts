import { RawData, WebSocket, WebSocketServer } from 'ws';
import {
    AddShipsData,
    AttackData,
    Coords,
    Game,
    PlayersData, RandomAttackData,
    REQUEST_TYPES,
    User
} from '../types';
import { gamesDataBase, roomDataBase, userDataBase } from '../db';
import { randomUUID } from 'crypto';
import { registerUser } from '../handlers/registerUser';
import { createRoom } from '../handlers/createRoom';
import { addUserToRoom } from '../handlers/addUserToRoom';
import { startGame } from '../handlers/startGame';
import { getShipsCoords } from '../helpers/getShipsCoords';
import { handleAttack } from '../handlers/handleAttack';
import { handleRandomAttack } from '../handlers/handleRandomAttack';

const WS_PORT = 3000;

const wss = new WebSocketServer({port: WS_PORT});
const clients = new Map();
const gameClients = new Map();
const roomCreators = new Map();
let playersData: Array<PlayersData> = [];
let firstPlayerShips: Array<Array<Coords>> | undefined = [];
let secondPlayerShips: Array<Array<Coords>> | undefined = [];
let firstPlayerHits: Array<Coords> = [];
let secondPlayerHits: Array<Coords> = [];
let game: Game;
let firstPlayer: PlayersData | undefined;
let secondPlayer: PlayersData | undefined;
let firstPlayerIndex: number | undefined;
let secondPlayerIndex: number | undefined;


wss.on('connection', (ws: WebSocket) => {
    const id = randomUUID();
    const metadata = {id};
    clients.set(ws, metadata);

    ws.on('message', (receivedMsg: RawData) => {
        console.log('received: %s', receivedMsg);
        const parsedMsg = JSON.parse(receivedMsg.toString());
        const clientId = clients.get(ws);
        const player: User | undefined = userDataBase.find((user: User) => user.clientId === clientId);
        const {type, data, id} = parsedMsg;
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
                const parsedData: AddShipsData = JSON.parse(parsedMsg.data);
                playersData.push({
                    ships: parsedData.ships,
                    indexPlayer: parsedData.indexPlayer,
                    ws
                });
                gamesDataBase.set(parsedData.gameId, {...gamesDataBase.get(parsedData.gameId), playersData});
                if (playersData.length !== playersAmount) return;
                startGame(playersData, id, parsedData.gameId);
                game = gamesDataBase.get(parsedData.gameId);
                [firstPlayer, secondPlayer] = game.playersData;
                if (!firstPlayer || !secondPlayer) return;
                firstPlayerShips = getShipsCoords(firstPlayer.ships);
                secondPlayerShips = getShipsCoords(secondPlayer.ships);
                playersData = [];
                break;
            case REQUEST_TYPES.ATTACK:
                const attackData: AttackData = JSON.parse(data);
                firstPlayerIndex = firstPlayer?.indexPlayer;
                secondPlayerIndex = secondPlayer?.indexPlayer;

                if (firstPlayerIndex === attackData.indexPlayer) {
                    handleAttack(secondPlayerHits, secondPlayerShips, attackData, secondPlayerIndex, id, game.playersData);
                } else {
                    handleAttack(firstPlayerHits, firstPlayerShips, attackData, firstPlayerIndex, id, game.playersData);
                }
                break;
            case REQUEST_TYPES.RANDOM_ATTACK:
                const randomAttackData: RandomAttackData = JSON.parse(data);
                if (firstPlayerIndex === randomAttackData.indexPlayer) {
                    handleRandomAttack(secondPlayerHits, secondPlayerShips, randomAttackData, secondPlayerIndex, id, game.playersData);
                } else {
                    handleRandomAttack(firstPlayerHits, firstPlayerShips, randomAttackData, firstPlayerIndex, id, game.playersData)
                }
                break;
            default:
                console.log('Can not find anything');
        }
    });

    ws.send(`WebSocketServer started on: ws://localhost:${WS_PORT}`);

    ws.on('close', () => {
        const clientId = clients.get(ws);
        const userIndex: number = userDataBase.findIndex((user: User) => user.clientId === clientId);
        const room = roomDataBase.find((r) => r.roomUsers[0]?.index === userIndex || r.roomUsers[1]?.index === userIndex);
        room && roomDataBase.splice(roomDataBase.indexOf(room), 1);
        clients.delete(ws);
    });
});
