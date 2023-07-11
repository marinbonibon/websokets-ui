import { PlayersData, RESPONSE_TYPES, StartGameData } from '../types';
import { sendAnswer } from '../helpers/sendAnswer';
import { gamesDataBase } from '../db';

export const startGame = (playersData:Array<PlayersData>, id:number, gameId:string) => {
    const gameInfo = gamesDataBase.get(gameId);
    playersData.forEach((player: PlayersData) => {
        const startGameData:StartGameData = {
            ships: player.ships,
            currentPlayerIndex: player.indexPlayer
        }
        sendAnswer(RESPONSE_TYPES.START_GAME, startGameData, player.ws, id);

        const turnData = {
            currentPlayer: gameInfo.roomUsers[0].index
        };
        sendAnswer(RESPONSE_TYPES.TURN, turnData, player.ws, id);
    })
}
