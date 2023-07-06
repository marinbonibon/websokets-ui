import { Registration } from '../db/types';
import { WebSocket } from 'ws';

export const sendAnswer = (type:string, data: unknown, ws: WebSocket, id: number) => {
    const answer = <Registration>{
        type,
        data: JSON.stringify(data),
        id
    }
    ws.send(JSON.stringify(answer));
}
