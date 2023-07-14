import { RawData, WebSocket, WebSocketServer } from 'ws';
import {
    AddShipsData,
    ATTACK_STATUSES,
    AttackData,
    Coords,
    Game,
    PlayersData,
    REQUEST_TYPES,
    User
} from '../types';
import { gamesDataBase, roomDataBase, userDataBase } from '../db';
import { randomUUID } from 'crypto';
import { registerUser } from '../handlers/registerUser';
import { createRoom } from '../handlers/createRoom';
import { addUserToRoom } from '../handlers/addUserToRoom';
import { startGame } from '../handlers/startGame';
import { attackEnemy } from '../handlers/attack';
import { getShipsCoords } from '../helpers/getShipsCoords';

const WS_PORT = 3000;

const wss = new WebSocketServer({port: WS_PORT});
const clients = new Map();
const gameClients = new Map();
const roomCreators = new Map();
let playersData: Array<PlayersData> = [];
let firstPlayerShips: Array<Array<Coords>> | undefined = [];
let secondPlayerShips: Array<Array<Coords>> | undefined = [];
let firstPlayerHits:Array<Coords> = [];
let secondPlayerHits: Array<Coords> = [];
let game:Game;
let firstPlayer: PlayersData | undefined;
let secondPlayer: PlayersData | undefined;

const handleAttack = (playerHits: Coords[], playerShips: Array<Array<Coords>> | undefined, attackData: AttackData, playerIndex: number | undefined, id: number) => {
    const wasHitBefore = playerHits.find((coords:Coords) => coords.x === attackData.x && coords.y === attackData.y);
    if (wasHitBefore) return;
    const aroundShipCells: Coords[] = [];
    const shotShip = playerShips?.map((ship: Coords[]) => {
        const wreckedCoordinates = ship.find((coord: Coords) => coord.x === attackData.x && coord.y === attackData.y);
        if (wreckedCoordinates) {
            wreckedCoordinates.status = ATTACK_STATUSES.SHOT;
            playerHits.push(wreckedCoordinates);
            return ship;
        } else {
            playerHits.push({x: attackData.x, y: attackData.y, status: ATTACK_STATUSES.MISS});
        }
    }).filter((el: Coords[] | undefined) => el)[0];
    attackEnemy(game.playersData, attackData, id, playerIndex, shotShip, aroundShipCells, playerHits);
}

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
                const firstPlayerIndex = firstPlayer?.indexPlayer;
                const secondPlayerIndex = secondPlayer?.indexPlayer;

                if (firstPlayerIndex === attackData.indexPlayer) {
                    handleAttack(secondPlayerHits, secondPlayerShips, attackData, secondPlayerIndex, id);
                } else {
                    handleAttack(firstPlayerHits, firstPlayerShips, attackData, firstPlayerIndex, id);
                }
                break;

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
