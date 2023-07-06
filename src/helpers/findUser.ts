import { dataBase } from '../db';

export const findUser = (name: string) => {
    return dataBase.find((user) => user.name === name);
}
