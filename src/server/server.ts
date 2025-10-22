import { WebSocket, WebSocketServer } from "ws";
import { ChatMessage } from "../types";
import { generateUniqueName } from "../generator";
import { Payload } from "../payload";
import { ChatRoom } from "../chat-room";
import { ChatClient } from "../chat-client";
import { DataSource } from "../datasource/datasource";
import { MessageModel } from "../datasource/schemas/message.schema";
export class ChatServer {

    private chatRooms: ChatRoom[];
    private clients: Map<string, ChatClient>;
    private messages: ChatMessage[];
    private wss: WebSocketServer;
    private datasource: DataSource;

    constructor(port: number) {
        this.wss = new WebSocketServer({ port })
        this.messages = [];
        this.clients = new Map<string, ChatClient>();
        this.chatRooms = [];
        this.datasource = new DataSource("mongodb://127.0.0.1:27017/chat");
    }

    broadcast = (payload: Payload, exception?: string): void => {
        for (const [ string, client ] of this.clients.entries()) {
            if (string == exception) {
                continue;
            } 
            if (this.chatRooms.find((chatRoom) => {
                return chatRoom.clients.includes(client);
            })) {
                continue;
            }
            client.send(payload);
        }
    }

    sendTo = (data: Payload, clientId: string): void => {
        const client = this.clients.get(clientId);
        if (!client) {
            return
        }
        client.send(data);
    }

    private onLeave = (clientId: string): void => {
        this.onRoomLeave(clientId);
        const leaveMessage = new Payload("leave", clientId);
        this.broadcast(leaveMessage);
        this.clients.delete(clientId);
    }

    private onRoomLeave = (clientId: string): void => {
        const chatClient = this.clients.get(clientId);
        if (!chatClient) return;
        
        let roomIx = -1;
        const room = this.chatRooms.find((chatRoom, index) => {
            roomIx = index;
            return chatRoom.clients.includes(chatClient);
        });

        room?.clients.forEach((client) => {
            const leaveRoomPayload = new Payload(
                "leaveRoom",
                clientId,
            );

            client.send(leaveRoomPayload);

            const usersPayload = new Payload(
                "users",
                [...this.clients.keys()],
            );
            
            
            client.send(usersPayload);
        });
        this.chatRooms.splice(roomIx, 1);
    }

    private onConnect = async (client: WebSocket): Promise<void> => {
        const clientId: string = await generateUniqueName();
        const chatClient = new ChatClient(clientId, client)

        this.clients.set(clientId, chatClient);

        const messages = await this.datasource.findMessages();
        const messagesPayload = new Payload("messages", messages)
        this.sendTo(messagesPayload, clientId);

        const joinPayload = new Payload("join", clientId);
        this.broadcast(joinPayload);

        const newUserIdPayload = new Payload("uuid", clientId)
        this.sendTo(newUserIdPayload, clientId);

        const usersPayload = new Payload("users", [...this.clients.keys()])
        this.sendTo(usersPayload, clientId)

        if (this.clients.size === 1 && this.messages.length === 0) {
            const firstPayload = new Payload("first", "Добро пожаловать. Вы первый в чате.")
            this.sendTo(firstPayload, clientId);
        }
        
        client.on("message", (data, isBinary) => {
            if (isBinary) {
                console.error("binary message data is not supported");
                return;
            };

            let parsedData: Payload = { value: undefined, type: undefined };
    
            try {
                parsedData = JSON.parse(data.toString());
            } catch (e) {
                console.error("could not parse json payload");
                return;
            }

            const payload = new Payload(parsedData.type, parsedData.value);

            switch(payload.type) {
                case "message":
                    const message = new Payload("message", payload.value);
                    
                    new MessageModel(parsedData.value).save();

                    const room = this.chatRooms.find((room) => {
                        return room.clients.includes(chatClient);
                    });
                    if (room) {
                        room.clients.forEach((client) => {
                            client.send(message);
                        });
                        break;
                    } else {
                        this.messages.push(
                        payload.value as ChatMessage,
                    );
                    
                    this.broadcast(message);
                    }
                    break;
                case "createRoom":
                    const thisClient = this.clients.get(clientId);
                    const otherClient = this.clients.get(payload.value as string);
                
                    if (!otherClient) {
                        console.error("client requested to chat privately does not exist");
                        return;
                    }
                    if (this.chatRooms.find((chatRoom) => {
                        console.log(chatRoom);
                        return chatRoom.clients.includes(thisClient);
                    })) {
                        console.error("client is in a room already");
                        return;
                    }

                    const chatRoom = new ChatRoom(thisClient, otherClient);
                    this.chatRooms.push(chatRoom);

                    const usersPayload = new Payload(
                        "users",
                        [thisClient.id, otherClient.id]
                    )
                    const roomPayloadThis = new Payload(
                        "createRoom",
                        otherClient.id,
                    )
                    const roomPayloadOther = new Payload(
                        "createRoom",
                        thisClient.id,
                    )
                    otherClient.send(roomPayloadOther);
                    thisClient.send(roomPayloadThis);

                    otherClient.send(usersPayload);
                    thisClient.send(usersPayload);
                    break;
                case "leaveRoom":
                    this.onRoomLeave(clientId);
                    break;
                default:
                    console.error(`unsupported payload type: ${payload.type}`);
            }            
        });
        client.on("close", () => {
            this.onLeave(clientId);
        });
    }

    start = (): void => {
        this.wss.addListener("connection", this.onConnect);
    }
}