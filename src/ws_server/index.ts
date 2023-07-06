import { RawData, WebSocket, WebSocketServer } from 'ws';
import { RegData } from '../db/types';
import { dataBase } from '../db';
import { findUser } from '../helpers/findUser';
import { sendAnswer } from '../helpers/sendAnswer';

const WS_PORT = 3000;

const wss = new WebSocketServer({port: WS_PORT});

wss.on('connection', function connection(ws: WebSocket) {
    ws.on('message', function message(receivedMsg: RawData) {
        console.log('received: %s', receivedMsg);
        const parsedData = JSON.parse(receivedMsg.toString());
        const {type, data, id} = parsedData;
        switch (type) {
            case 'reg':
                const user = JSON.parse(data);
                const isUserExist = findUser(user.name);
                if (!isUserExist) {
                    dataBase.push(user);
                    //remove console.log
                    console.log('dataBase', dataBase);
                    const regData = {
                        name: user.name,
                        index: dataBase.indexOf(user),
                        error: false,
                        errorText: ''
                    };
                    sendAnswer(type, regData, ws, id);
                } else {
                    const regData:RegData = {
                        name: '',
                        index: -1,
                        error: true,
                        errorText: 'User with such name already exists'
                    };
                    sendAnswer(type, regData, ws, id);
                }

                break;
        }
    });

    ws.send(`WebSocketServer started on: ws://localhost:${WS_PORT}`);
});
