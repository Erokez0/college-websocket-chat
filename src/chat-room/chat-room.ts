import { ChatClient } from "../chat-client";
import { Payload } from "../payload";
import { ChatMessage } from "../types";

export class ChatRoom {
    clients: [ChatClient, ChatClient];

    constructor(...clients: [ChatClient, ChatClient]) {
        if (clients[0].id === clients[1].id) {
            throw new Error("client can not create a private chat room with itself");
        }
        this.clients = clients;
    }

    sendMessage(message: ChatMessage, sender: ChatClient) {
        if (!this.clients.includes(sender)) {
            console.error("sender is not in the room");
            return;
        }
        const messagePayload = new Payload("message", message);
        this.clients.forEach((client) => {
            if (client.id == sender.id) return;
            client.send(messagePayload);
        })
    }
}