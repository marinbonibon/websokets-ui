import { gamesDataBase, roomDataBase, userDataBase } from '../db';
import { CreateGameData, RESPONSE_TYPES, UpdateRoomData, UserInfo } from '../types';
import { sendAnswer } from '../helpers/sendAnswer';

export const addUserToRoom = (args: any) => {
    const { data, player, roomCreators, gameClients, metadata, ws, id, clients } = args;
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
    // create map for 2 players and send them create game
    const host = userDataBase[firstPlayer.index];
    const hostId = [...roomCreators.keys()].find((clientId) => clientId === host?.clientId?.id);
    const hostClient = roomCreators.get(hostId);
    gameClients.set(hostId, hostClient);
    roomCreators.delete(hostId);
    gameClients.size < playersAmount && gameClients.set(metadata.id, ws);
    const gameClientsArr = [...gameClients.values()];
    gameClientsArr.forEach((client) => {
        const createGameData: CreateGameData = {
            idGame,
            idPlayer: gameClientsArr.indexOf(client),
        };
        sendAnswer(RESPONSE_TYPES.CREATE_GAME, createGameData, client, id);
    });
    gamesDataBase.set(idGame, gameClientsArr);
    roomDataBase.splice(indexRoom, 1);
    gameClients.clear();
    [...clients.keys()].forEach((client) => {
        sendAnswer(RESPONSE_TYPES.UPDATE_ROOM, roomDataBase, client, id);
    });
}
