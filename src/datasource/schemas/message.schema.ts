import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
    authorId: String,
    sentAt: Number,
    content: String,
    type: {
        type: String,
        enum: [ "public", "private" ]
    }
});

export const MessageModel = mongoose.model("ChatMessage", MessageSchema)