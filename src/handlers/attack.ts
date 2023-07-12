import { ATTACK_STATUSES, AttackData, Coords, PlayersData, RESPONSE_TYPES } from '../types';
import { sendAnswer } from '../helpers/sendAnswer';

export const attackEnemy = (playersData: PlayersData[], attackData: AttackData, id: number, playerIndex: number | undefined, shotShip: Coords[] | undefined) => {
    let responseStatus: string;
    playersData.forEach((player: PlayersData) => {
        if (!shotShip?.length) {
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
        } else {
            const survivedCells = shotShip.filter((coord: Coords) => coord.status === '');
            if (!survivedCells.length) {
                responseStatus = ATTACK_STATUSES.KILLED;
                shotShip.forEach((coord: Coords) => {
                    coord.status = ATTACK_STATUSES.KILLED;
                    const attackAnswer = {
                        position: {
                            x: coord.x,
                            y: coord.y
                        },
                        currentPlayer: attackData.indexPlayer,
                        status: responseStatus
                    };
                    sendAnswer(RESPONSE_TYPES.ATTACK, attackAnswer, player.ws, id);
                })
            } else {
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
            }
        }
        const turnData = {
            currentPlayer: responseStatus === ATTACK_STATUSES.SHOT || responseStatus === ATTACK_STATUSES.KILLED ? attackData.indexPlayer : playerIndex
        };
        sendAnswer(RESPONSE_TYPES.TURN, turnData, player.ws, id);
    })
}
