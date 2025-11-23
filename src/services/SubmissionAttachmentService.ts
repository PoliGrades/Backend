import { Collection } from "mongodb";
import { MongoDBDatabase } from "../database/MongoDBDatabase.ts";
import { ISubmissionAttachment } from "../interfaces/ISubmissionAttachment.ts";

export class SubmissionAttachmentService {
  private db: MongoDBDatabase;
  private collection: Collection<ISubmissionAttachment>;

  constructor() {
    this.db = new MongoDBDatabase();

    this.db.createDatabase("poligrades");
    this.collection = this.db.createCollection<ISubmissionAttachment>(
      "submission_attachments",
    );
  }

  async addSubmissionAttachment(
    attachment: ISubmissionAttachment,
  ): Promise<void> {
    const result = await this.collection.insertOne(attachment);
    if (!result.acknowledged) {
      throw new Error("Failed to add submission attachment");
    }
  }

  async getSubmissionAttachmentsBySubmissionId(
    submissionId: number,
  ): Promise<ISubmissionAttachment[]> {
    return await this.collection.find({ submissionId }).toArray();
  }

  async getSubmissionAttachmentByName(
    name: string,
  ): Promise<ISubmissionAttachment | null> {
    return await this.collection.findOne({ fileName: name });
  }

  async getSubmissionAttachments(): Promise<ISubmissionAttachment[]> {
    return await this.collection.find({}).toArray();
  }
}
