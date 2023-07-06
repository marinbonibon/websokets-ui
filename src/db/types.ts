export interface User {
    name: string,
    password: string
}

export interface Registration {
    type: string,
    data: string,
    id: number
}

export interface RegData {
    name: string,
    index: number,
    error: boolean,
    errorText: string
}
