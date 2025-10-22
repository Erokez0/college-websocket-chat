import { model, Model, Schema } from "mongoose";

const ChatRoomSchema = new Schema({
    type: {
        type: String,
        enum: [
            "public", 
            "private"
        ]
    },
    users: [{ type: Schema.ObjectId, ref: "ChatUser" }],
    messages: [{ type: Schema.ObjectId, ref: "ChatMessage" }],
})

const ChatRoomModel = model("Room", ChatRoomSchema);

export { ChatRoomModel, ChatRoomSchema}