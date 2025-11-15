import { Collection } from "mongodb";
import { MongoDBDatabase } from "../database/MongoDBDatabase.ts";
import { ITaskAttachment } from "../interfaces/ITaskAttachment.ts";

export class TaskAttachmentService {
  private db: MongoDBDatabase;
  private collection: Collection<ITaskAttachment>;

  constructor() {
    this.db = new MongoDBDatabase();

    this.db.createDatabase("poligrades");
    this.collection = this.db.createCollection<ITaskAttachment>("attachments");
  }

  async addTaskAttachment(attachment: ITaskAttachment): Promise<void> {
    const result = await this.collection.insertOne(attachment);
    if (!result.acknowledged) {
      throw new Error("Failed to add task attachment");
    }
  }

  async getTaskAttachmentsByTaskId(taskId: number): Promise<ITaskAttachment[]> {
    return await this.collection.find({ taskId }).toArray();
  }

  async getTaskAttachments(): Promise<ITaskAttachment[]> {
    return await this.collection.find({}).toArray();
  }
}