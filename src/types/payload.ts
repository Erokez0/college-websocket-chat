enum PayloadTypes {
    MESSAGE = "message",
    MESSAGES = "messages",
    USERS = "users",
    JOIN = "join",
    LEAVE = "leave",
    UUID = "uuid"
}

interface Payload<T> {
    type: PayloadTypes;
    value: T[] | T;
}


export { PayloadTypes, type Payload };