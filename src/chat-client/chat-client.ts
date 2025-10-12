import WebSocket from "ws";
import { Payload } from "../payload";

export class ChatClient {
    webSocket: WebSocket;
    id: string;

    constructor(id: string, webSocket: WebSocket) {
        this.id = id;
        this.webSocket = webSocket;
    }

    send(payload: Payload): void {
        this.webSocket.send(
            JSON.stringify(payload)
        );
    }
}