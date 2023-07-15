import { User, UserInfo } from '../types';

export const findUser = (db: Array<User|UserInfo>, name: string) => {
    return db.find((user: User|UserInfo) => user.name === name);
}
