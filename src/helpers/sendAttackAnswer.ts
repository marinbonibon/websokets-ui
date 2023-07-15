import { AttackData, RESPONSE_TYPES } from '../types';
import { sendAnswer } from './sendAnswer';
import WebSocket from 'ws';

export const sendAttackAnswer = (status: string, attackData: AttackData, ws: WebSocket, id: number) => {
    const attackAnswer = {
        position: {
            x: attackData.x,
            y: attackData.y
        },
        currentPlayer: attackData.indexPlayer,
        status
    };
    sendAnswer(RESPONSE_TYPES.ATTACK, attackAnswer, ws, id);

}
