import { ChatMessage } from "../types";

type PayloadType = "message" | "messages" | "users" | 
                    "join" | "leave" | "uuid" | 
                    "createRoom" | "leaveRoom" | "first";

type PayloadValuesTypes = string | string[] | ChatMessage | ChatMessage[];

export class Payload {
    value: PayloadValuesTypes;
    type: PayloadType;

    constructor(type: PayloadType, value: PayloadValuesTypes) {
        this.type = type;
        this.value = value;
    }
}