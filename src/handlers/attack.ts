import { ATTACK_STATUSES, AttackData, Coords, PlayersData, RESPONSE_TYPES } from '../types';
import { sendAnswer } from '../helpers/sendAnswer';
import { sendAttackAnswer } from '../helpers/sendAttackAnswer';

export const attackEnemy = (playersData: PlayersData[], attackData: AttackData, id: number, playerIndex: number | undefined, shotShip: Coords[] | undefined, aroundShipCells: Coords[], playerHits: Coords[]) => {
    let responseStatus: string;
    let uniqueCoordinates:Coords[];
    playersData.forEach((player: PlayersData) => {
        if (!shotShip?.length) {
            responseStatus = ATTACK_STATUSES.MISS;
            sendAttackAnswer(responseStatus, attackData, player.ws, id);
        } else {
            const survivedCells = shotShip.filter((coord: Coords) => coord.status === '');
            if (!survivedCells.length) {
                responseStatus = ATTACK_STATUSES.KILLED;

                shotShip.forEach((coord: Coords, i: number) => {
                    coord.status = ATTACK_STATUSES.KILLED;
                    const attackAnswer = {
                        position: {
                            x: coord.x,
                            y: coord.y
                        },
                        currentPlayer: attackData.indexPlayer,
                        status: responseStatus
                    };

                    const prevX = coord.x - 1;
                    const prevY = coord.y - 1;
                    const nextX = coord.x + 1;
                    const nextY = coord.y + 1;
                    const boardSize = 10;

                    if (coord.direction === 'horizontal') {
                        if (prevY >= 0) {
                            aroundShipCells.push({x: coord.x, y: prevY, status: ATTACK_STATUSES.MISS });
                        }
                        if (nextY < boardSize) {
                            aroundShipCells.push({x: coord.x, y: nextY, status: ATTACK_STATUSES.MISS });
                        }

                        if (prevX !== shotShip[i - 1]?.x) {
                            aroundShipCells.push({x: prevX, y: coord.y, status: ATTACK_STATUSES.MISS });
                        }
                        if (nextX !== shotShip[i + 1]?.x) {
                            aroundShipCells.push({x: nextX, y: coord.y, status: ATTACK_STATUSES.MISS });
                        }
                    }

                    if (coord.direction === 'vertical') {
                        if (prevX >= 0) {
                            aroundShipCells.push({x: prevX, y: coord.y, status: ATTACK_STATUSES.MISS });
                        }
                        if (nextX < boardSize) {
                            aroundShipCells.push({x: nextX, y: coord.y, status: ATTACK_STATUSES.MISS });
                        }

                        if (prevY !== shotShip[i - 1]?.y) {
                            aroundShipCells.push({x: coord.x, y: prevY, status: ATTACK_STATUSES.MISS });
                        }
                        if (nextY !== shotShip[i + 1]?.y) {
                            aroundShipCells.push({x: coord.x, y: nextY, status: ATTACK_STATUSES.MISS });
                        }
                    }

                    if (nextX !== shotShip[i + 1]?.x  && nextY !== shotShip[i + 1]?.y) {
                        aroundShipCells.push({x: nextX, y: nextY, status: ATTACK_STATUSES.MISS });
                    }

                    if (nextX !== shotShip[i + 1]?.x  && prevY !== shotShip[i + 1]?.y) {
                        aroundShipCells.push({x: nextX, y: prevY, status: ATTACK_STATUSES.MISS });
                    }

                    if (prevX !== shotShip[i - 1]?.x  && prevY !== shotShip[i - 1]?.y) {
                        aroundShipCells.push({x: prevX, y: prevY, status: ATTACK_STATUSES.MISS });
                    }

                    if (prevX !== shotShip[i - 1]?.x  && nextY !== shotShip[i - 1]?.y) {
                        aroundShipCells.push({x: prevX, y: nextY, status: ATTACK_STATUSES.MISS });
                    }


                    uniqueCoordinates = aroundShipCells.filter((obj: Coords, index: number, self: Coords[]) => {
                        return self.findIndex(item => item.x === obj.x && item.y === obj.y) === index;
                    });

                    sendAnswer(RESPONSE_TYPES.ATTACK, attackAnswer, player.ws, id);
                });

                uniqueCoordinates.forEach((coord: Coords) => {
                    const attackAnswer = {
                        position: {
                            x: coord.x,
                            y: coord.y
                        },
                        currentPlayer: attackData.indexPlayer,
                        status: ATTACK_STATUSES.MISS
                    };
                    sendAnswer(RESPONSE_TYPES.ATTACK, attackAnswer, player.ws, id);
                })
                playerHits.push(...uniqueCoordinates);
            } else {
                responseStatus = ATTACK_STATUSES.SHOT;
                sendAttackAnswer(responseStatus, attackData, player.ws, id);
            }
        }
        const turnData = {
            currentPlayer: responseStatus === ATTACK_STATUSES.SHOT || responseStatus === ATTACK_STATUSES.KILLED ? attackData.indexPlayer : playerIndex
        };
        sendAnswer(RESPONSE_TYPES.TURN, turnData, player.ws, id);
    })
}
