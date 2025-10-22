import mongoose, { Schema } from "mongoose";
import { ChatMessage } from "../types";
import { MessageModel } from "./schemas/message.schema";

export class DataSource {

    constructor(url?: string) {
        this.connect(url).then( () => {
            console.log("Connected to mongodb")
        });
    }

    private async connect(url?: string) {
        await mongoose.connect(url);
        const newMessage = new MessageModel({
            authorId: "dev",
            type: "private",
            content: "hello there!",
        })
        newMessage.save()
    }
    
    async findMessages(): Promise<ChatMessage[]> {
        return await MessageModel.find({})
    }
}