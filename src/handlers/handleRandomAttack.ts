import { ATTACK_STATUSES, AttackData, Coords, PlayersData, RandomAttackData } from '../types';
import { attackEnemy } from '../helpers/attack';

export const handleRandomAttack = (playerHits: Coords[], playerShips: Array<Array<Coords>> | undefined, randomAttackData: RandomAttackData, playerIndex: number | undefined, id: number, playersData: PlayersData[]) => {
    const boardSize = 10;
    const getRandomInt = () => {
        return Math.floor(Math.random() * boardSize);
    };
    let x = getRandomInt();
    let y = getRandomInt();
    const findHit = () => {
        const alreadyShot = playerHits.find((coords: Coords) => coords.x === x && coords.y === y);
        if (alreadyShot) {
            x = getRandomInt();
            y = getRandomInt();
            findHit();
        }
    };
    findHit();
    const aroundShipCells: Coords[] = [];
    const shotShip = playerShips?.map((ship: Coords[]) => {
        const wreckedCoordinates = ship.find((coord: Coords) => coord.x === x && coord.y === y);
        if (wreckedCoordinates) {
            wreckedCoordinates.status = ATTACK_STATUSES.SHOT;
            playerHits.push(wreckedCoordinates);
            return ship;
        } else {
            playerHits.push({x, y, status: ATTACK_STATUSES.MISS});
        }
    }).filter((el: Coords[] | undefined) => el)[0];
    const data: AttackData = {
        gameId: randomAttackData.gameId,
        x,
        y,
        indexPlayer: randomAttackData.indexPlayer
    }
    attackEnemy(playersData, data, id, playerIndex, shotShip, aroundShipCells, playerHits);
}
