import { Collection } from "mongodb";
import { MongoDBDatabase } from "../database/MongoDBDatabase.ts";
import { IMessage } from "../interfaces/IMessage.ts";
import { messageSchema } from "../schemas/zodSchema.ts";

export class ChatService {
  private db: MongoDBDatabase;
  private collection: Collection<IMessage>;

  constructor() {
    this.db = new MongoDBDatabase();

    this.db.createDatabase("poligrades");
    this.collection = this.db.createCollection<IMessage>("messages");
  }

  public getMessagesFromChat(chatID: string): Promise<IMessage[]> {
    return this.collection.find({ room_id: chatID }).toArray();
  }

  public async saveMessage(message: string, sender: {
    id: number;
    name: string;
    role: "STUDENT" | "PROFESSOR";
  }, chat_id: string): Promise<IMessage> {
    const messageDocument: IMessage = {
      room_id: chat_id,
      sender_id: sender.id,
      sender_name: sender.name,
      sender_role: sender.role,
      message,
      timestamp: new Date(),
    };

    if (!messageSchema.safeParse(messageDocument).success) {
      throw new Error("Invalid message format");
    }

    const result = await this.collection.insertOne(messageDocument);
    if (!result.acknowledged) {
      throw new Error("Failed to save message");
    }
    
    return messageDocument;
  }
}
