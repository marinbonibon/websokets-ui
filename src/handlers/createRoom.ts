import { roomDataBase, userDataBase } from '../db';
import { ClientId, RESPONSE_TYPES, UpdateRoomData, User } from '../types';
import { findUser } from '../helpers/findUser';
import { sendAnswer } from '../helpers/sendAnswer';
import { WebSocket } from 'ws';

export const createRoom = (player:User| undefined, roomCreators: Map<string, WebSocket>, metadata: ClientId, ws: WebSocket, clients: Map<WebSocket, string>, id: number) => {
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
}
