import { PlayersData, RESPONSE_TYPES, StartGameData } from '../types';
import { sendAnswer } from '../helpers/sendAnswer';

export const startGame = (playersData:Array<PlayersData>, id:number) => {
    playersData.forEach((player: PlayersData) => {
        const startGameData:StartGameData = {
            ships: player.ships,
            currentPlayerIndex: player.indexPlayer
        }
        sendAnswer(RESPONSE_TYPES.START_GAME, startGameData, player.ws, id);

        const turnData = {
            currentPlayer: 0
        };
        sendAnswer(RESPONSE_TYPES.TURN, turnData, player.ws, id);
    })
}
