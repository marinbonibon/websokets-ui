import { Answer } from '../types';
import { WebSocket } from 'ws';

export const sendAnswer = (type:string, data: unknown, ws: WebSocket, id: number) => {
    const answer = <Answer>{
        type,
        data: JSON.stringify(data),
        id
    }
    ws.send(JSON.stringify(answer));
}
