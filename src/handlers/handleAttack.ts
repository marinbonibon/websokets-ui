import { ATTACK_STATUSES, AttackData, Coords, PlayersData } from '../types';
import { attackEnemy } from '../helpers/attack';

export const handleAttack = (playerHits: Coords[], playerShips: Array<Array<Coords>> | undefined, attackData: AttackData, playerIndex: number | undefined, id: number, playersData: PlayersData[]) => {
    const wasHitBefore = playerHits.find((coords: Coords) => coords.x === attackData.x && coords.y === attackData.y);
    if (wasHitBefore) return;
    const aroundShipCells: Coords[] = [];
    const shotShip = playerShips?.map((ship: Coords[]) => {
        const wreckedCoordinates = ship.find((coord: Coords) => coord.x === attackData.x && coord.y === attackData.y);
        if (wreckedCoordinates) {
            wreckedCoordinates.status = ATTACK_STATUSES.SHOT;
            playerHits.push(wreckedCoordinates);
            return ship;
        } else {
            playerHits.push({x: attackData.x, y: attackData.y, status: ATTACK_STATUSES.MISS});
        }
    }).filter((el: Coords[] | undefined) => el)[0];
    attackEnemy(playersData, attackData, id, playerIndex, shotShip, aroundShipCells, playerHits);
}
