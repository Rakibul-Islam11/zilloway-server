const { Schema, model } = require("mongoose");

// Message sub-schema
const messageSchema = new Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false },
});

// Main Chat schema
const chatSchema = new Schema(
    {
        chatId: { type: String, required: true, unique: true }, // postId + buyerId
        postId: { type: String, required: true },
        sellerId: { type: String, required: true },
        buyerId: { type: String, required: true },
        messages: [messageSchema],
    },
    { timestamps: true } // createdAt, updatedAt auto add
);

const Chat = model("Chat", chatSchema);
module.exports = Chat;
