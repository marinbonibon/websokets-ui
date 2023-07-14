import { Coords, Ships } from '../types';

export const getShipsCoords = (ships: Ships[]) => {
    return ships?.reduce((acc: Array<Array<Coords>>, ship: Ships) => {
        const shipCoordinates: Array<Coords> = [];
        const playFieldSize = 9;
        if (!ship.direction) {
            for(let i = 0; i < ship.length; i++) {
                const xCoords = ship.position.x < playFieldSize ? ship.position.x + i : ship.position.x;
                shipCoordinates.push({x: xCoords, y: ship.position.y, status: '', direction: 'horizontal'});
            }
        } else {
            for(let i = 0; i < ship.length; i++) {
                const yCoords = ship.position.y < playFieldSize ? ship.position.y + i : ship.position.y;
                shipCoordinates.push({x: ship.position.x, y: yCoords, status: '', direction: 'vertical'});
            }
        }
        acc.push(shipCoordinates);
        return acc;
    }, []);
}
