import { ChatClient } from "../chat-client";
import { Payload } from "../payload";
import { ChatMessage } from "../types";
import { ChatRoomModel, ChatRoomSchema } from "../datasource/schemas/room.schema";
import { Types } from "mongoose";

export class ChatRoom {
    clients: ChatClient[];

    constructor(...clients: ChatClient[]) {
        this.clients = clients;
        const id = clients.map( (client) => client.id).sort().join("_");
        const a = new ChatRoomModel({
            type: "private",
            _id: id
        }, id)
        a.save().then(() =>
            ChatRoomModel.findById(id).then( (val) => {
                console.log(val)
            })
        )
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