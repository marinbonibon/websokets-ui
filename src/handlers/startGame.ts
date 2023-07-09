import { AddShipsData, RESPONSE_TYPES, StartGameData } from '../types';
import { gamesDataBase } from '../db';
import { sendAnswer } from '../helpers/sendAnswer';
import WebSocket from 'ws';

export const startGame = (parsedData:AddShipsData, id:number) => {
    const { gameId, ships, indexPlayer } = parsedData;
    const gameClientsArr = gamesDataBase.get(gameId);
    const startGameData:StartGameData = {
        ships: ships,
        currentPlayerIndex: indexPlayer
    }
    gameClientsArr.forEach((client: WebSocket) => {
        sendAnswer(RESPONSE_TYPES.START_GAME, startGameData, client, id);
    });
}
