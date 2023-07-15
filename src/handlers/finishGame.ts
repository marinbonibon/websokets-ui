import { ATTACK_STATUSES, Coords, FinishData, PlayersData, RESPONSE_TYPES } from '../types';
import { sendAnswer } from '../helpers/sendAnswer';

export const finishGame = (enemyShips: Array<Array<Coords>> | undefined, playerId: number | undefined,  id: number, playersData: PlayersData[], clearGame: Function, gameId: number | undefined) => {
    const shipsAmount = 10;
    let killedShips = 0;

    enemyShips?.forEach((ship: Coords[]) => {
        const isShipKilled = ship.every((coord:Coords) => {
            return coord.status === ATTACK_STATUSES.KILLED;
        });
        if (isShipKilled) {
            killedShips += 1;
        }
    });
    playersData.forEach((player: PlayersData) => {
        if (killedShips === shipsAmount) {
            const finishData: FinishData = {
                winPlayer: playerId,
            };
            sendAnswer(RESPONSE_TYPES.FINISH, finishData, player.ws, id);
            clearGame(gameId);
        }
    })

}
