import { WebSocket, WebSocketServer } from "ws";
import { ChatMessage, Payload, PayloadTypes } from "../types";
import { generateUniqueName } from "../generator/generate-unique-name";

export class ChatServer {
    public connections: Map<string, WebSocket>;
    public messages: ChatMessage[];
    public wss: WebSocketServer;

    constructor(port: number) {
        this.wss = new WebSocketServer({ port })
        this.messages = [];
        this.connections = new Map<string, WebSocket>();
    }

    broadcast = <T>(data: Payload<T>, exception?: string): void => {
        for (const [ string, conn ] of this.connections.entries()) {
            if (string == exception) {
                continue;
            } 
            conn.send(JSON.stringify(data));
        }
    }

    sendTo = <T>(data: Payload<T>, clientId: string): void => {
        const client = this.connections.get(clientId);
        if (!client) {
            return
        }
        client.send(JSON.stringify(data));
    }

    onLeave = (clientId: string): void => {
        this.connections.delete(clientId);
        const leaveMessage: Payload<string> = {
            type: PayloadTypes.LEAVE,
            value: clientId,
        };
        this.broadcast(leaveMessage);
    }

    onConnect = async (client: WebSocket): Promise<void> => {
        let clientId: string = await generateUniqueName();

        this.connections.set(clientId, client);

        const joinPayload: Payload<string> = {
            type: PayloadTypes.JOIN,
            value: clientId,
        }
        this.broadcast(joinPayload);

        const newUserIdPayload: Payload<string> = {
            type: PayloadTypes.UUID,
            value: clientId,
        }
        this.sendTo(newUserIdPayload, clientId);
        
        const messagesPayload: Payload<ChatMessage[]> = {
            type: PayloadTypes.MESSAGES,
            value: this.messages,
        }
        this.sendTo(messagesPayload, clientId);

        const usersPayload: Payload<string[]> = {
            type: PayloadTypes.USERS,
            value: [...this.connections.keys()],
        }
        this.sendTo(usersPayload, clientId)
        
        client.on("message", (data, isBinary) => {
            if (isBinary)  return;

            const parsedData = JSON.parse(data.toString());
            this.messages.push(parsedData);
            const messagesPayload: Payload<ChatMessage> = {
                type: PayloadTypes.MESSAGE,
                value: parsedData,

            }
            this.broadcast(messagesPayload);
        })
        client.on("close", () => {
            this.onLeave(clientId);
        })
    }

    start = (): void => {
        this.wss.addListener("connection", this.onConnect);
    }
}