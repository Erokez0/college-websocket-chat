import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
    authorId: String,
    sentAt: Number,
    content: String,
});

const MessageModel = mongoose.model("ChatMessage", MessageSchema);

export {
    MessageModel, MessageSchema
}