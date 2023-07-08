export interface User {
    name: string,
    password: string,
    clientId?: string,
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
