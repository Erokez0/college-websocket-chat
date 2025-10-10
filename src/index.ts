import { ChatServer } from "./server/server";

const chatServer = new ChatServer(3333);
chatServer.start();