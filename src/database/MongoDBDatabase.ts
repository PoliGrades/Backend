import { Db, Document, MongoClient } from "mongodb";

export class MongoDBDatabase {
  private client: MongoClient;
  private database: Db | undefined;
  private uri: string;

  constructor() {
    this.uri = Deno.env.get("MONGODB_URI") || "mongodb://localhost:27017";
    this.client = new MongoClient(this.uri);
    this.client.connect();

    this.createDatabase("poligrades");
  }

  getClient(): MongoClient {
    return this.client;
  }

  createDatabase(dbName: string) {
    this.database = this.client.db(dbName);
    return this.database;
  }

  createCollection<T extends Document>(collectionName: string) {
    if (!this.database) {
      throw new Error("Database not initialized. Call createDatabase first.");
    }

    return this.database.collection<T>(collectionName);
  }

  getDatabase(): Db | undefined {
    return this.database;
  }
}
