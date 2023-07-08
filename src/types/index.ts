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
    UPDATE_ROOM = 'update_room'
}
