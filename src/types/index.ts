import WebSocket from 'ws';

export interface ClientId {
    id: string
}

export interface User {
    name: string,
    password: string,
    clientId?: ClientId,
}

export interface UserInfo {
    name: string,
    index: number
}

export interface Answer {
    type: string,
    data: string,
    id: number
}

export interface RegData {
    name: string,
    index: number,
    error: boolean,
    errorText: string
}

export interface UpdateRoomData {
    roomId: number,
    roomUsers: UserInfo[]
}

export interface CreateGameData {
    idGame: number,
    idPlayer: number
}

export interface Ships {
    position: {
        x: number,
        y: number,
    },
    direction: boolean,
    length: number,
    type: 'small'|'medium'|'large'|'huge',
}

export interface StartGameData {
    ships: Ships[],
    currentPlayerIndex: number
}

export interface AddShipsData {
    gameId: number,
    ships: Ships[],
    indexPlayer: number
}

export interface PlayersData {
    ships: Ships[],
    indexPlayer: number,
    ws: WebSocket
}

export interface AttackData {
    gameId: number,
    x: number,
    y: number,
    indexPlayer: number
}

export interface Coords {
    x: number,
    y: number,
    status?: string
}

export interface Game {
    roomId: number,
    roomUsers: UserInfo[],
    playersData: PlayersData[]
}

export enum REQUEST_TYPES {
    REG = 'reg',
    CREATE_ROOM = 'create_room',
    ADD_USER_TO_ROOM = 'add_user_to_room',
    ADD_SHIPS = 'add_ships',
    ATTACK = 'attack',
    RANDOM_ATTACK = 'randomAttack'
}

export enum RESPONSE_TYPES {
    REG = 'reg',
    UPDATE_WINNERS = 'update_winners',
    CREATE_GAME = 'create_game',
    UPDATE_ROOM = 'update_room',
    START_GAME = 'start_game',
    ATTACK = 'attack',
    TURN = 'turn',
    FINISH = 'finish'
}

export enum ATTACK_STATUSES {
    SHOT = 'shot',
    MISS = 'miss',
    KILLED = 'killed'
}
