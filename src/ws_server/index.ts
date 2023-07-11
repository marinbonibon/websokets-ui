import { RawData, WebSocket, WebSocketServer } from 'ws';
import { AddShipsData, ATTACK_STATUSES, AttackData, Coords, Game, PlayersData, REQUEST_TYPES, User } from '../types';
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
                let status = '';

                if (firstPlayerIndex === attackData.indexPlayer) {
                    const wasHitBefore = secondPlayerHits.find((coords:Coords) => coords.x === attackData.x && coords.y === attackData.y);
                    if (wasHitBefore) return;
                    const isHit = secondPlayerShips?.map((ship: Coords[]) => {
                        const wreckedCoordinates = ship.find((coord: Coords) => coord.x === attackData.x && coord.y === attackData.y);
                        if (wreckedCoordinates) {
                            console.log('ship', ship);
                            secondPlayerHits.push(wreckedCoordinates);
                            ship.splice(ship.indexOf(wreckedCoordinates), 1);
                            console.log('ship2', ship);
                        }

                        if (ship.length === 0) {
                            status = ATTACK_STATUSES.KILLED;
                            // @ts-ignore
                            secondPlayerShips = secondPlayerShips?.filter((ship) => ship.length > 0);
                        }
                        return !!wreckedCoordinates;
                    }).filter((el: boolean) => el)[0];
                    if (!isHit) {
                        secondPlayerHits.push({x: attackData.x, y: attackData.y});
                    }
                    attackEnemy(game.playersData, isHit, attackData, id, secondPlayerIndex, status);
                }

                if(secondPlayerIndex === attackData.indexPlayer) {
                    const wasHitBefore = firstPlayerHits.find((coords:Coords) => coords.x === attackData.x && coords.y === attackData.y);
                    if (wasHitBefore) return;
                    const isHit = firstPlayerShips?.map((ship) => {
                        const wreckedCoordinates = ship.find((coord) => coord.x === attackData.x && coord.y === attackData.y);
                        if (wreckedCoordinates) {
                            firstPlayerHits.push(wreckedCoordinates);
                            ship.splice(ship.indexOf(wreckedCoordinates), 1);
                        }

                        if (ship.length === 0) {
                            status = ATTACK_STATUSES.KILLED;
                            // @ts-ignore
                            firstPlayerShips = secondPlayerShips?.filter((ship) => ship.length > 0);
                        }
                        return !!wreckedCoordinates;
                    }).filter((el: boolean) => el)[0];
                    if (!isHit) {
                        firstPlayerHits.push({x: attackData.x, y: attackData.y});
                    }
                    attackEnemy(game.playersData, isHit, attackData, id, firstPlayerIndex, status);
                }
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
