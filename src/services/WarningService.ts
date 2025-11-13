import { Collection } from "mongodb";
import { MongoDBDatabase } from "../database/MongoDBDatabase.ts";
import { IWarning } from "../interfaces/IWarning.ts";

export class WarningService {
  private db: MongoDBDatabase;
  private collection: Collection<IWarning>;

  constructor() {
    this.db = new MongoDBDatabase();

    this.db.createDatabase("poligrades");
    this.collection = this.db.createCollection<IWarning>("warnings");
  }

  async addWarning(warning: IWarning): Promise<void> {
    const result = await this.collection.insertOne(warning);
    if (!result.acknowledged) {
      throw new Error("Failed to add warning");
    }
  }

  async getWarnings(): Promise<IWarning[]> {
    return await this.collection.find({}).toArray();
  }
}