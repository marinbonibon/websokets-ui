import { ATTACK_STATUSES, AttackData, PlayersData, RESPONSE_TYPES } from '../types';
import { sendAnswer } from '../helpers/sendAnswer';

export const attackEnemy = (playersData: PlayersData[], isHit: boolean | undefined, attackData: AttackData, id: number, playerIndex: number | undefined, status: string) => {
    let responseStatus: string;
    playersData.forEach((player: PlayersData) => {
        if (isHit && !status) {
            responseStatus = ATTACK_STATUSES.SHOT;
            const attackAnswer = {
                position: {
                    x: attackData.x,
                    y: attackData.y
                },
                currentPlayer: attackData.indexPlayer,
                status: responseStatus
            };
            sendAnswer(RESPONSE_TYPES.ATTACK, attackAnswer, player.ws, id);
        } else if (isHit && status) {
            responseStatus = status;
            const attackAnswer = {
                position: {
                    x: attackData.x,
                    y: attackData.y
                },
                currentPlayer: attackData.indexPlayer,
                status: responseStatus
            };
            sendAnswer(RESPONSE_TYPES.ATTACK, attackAnswer, player.ws, id);
        } else {
            responseStatus = ATTACK_STATUSES.MISS;
            const attackAnswer = {
                position: {
                    x: attackData.x,
                    y: attackData.y
                },
                currentPlayer: attackData.indexPlayer,
                status: responseStatus
            };
            sendAnswer(RESPONSE_TYPES.ATTACK, attackAnswer, player.ws, id);
        }
        const turnData = {
            currentPlayer: responseStatus === ATTACK_STATUSES.SHOT || responseStatus === ATTACK_STATUSES.KILLED ? attackData.indexPlayer : playerIndex
        };
        sendAnswer(RESPONSE_TYPES.TURN, turnData, player.ws, id);
    })
}
