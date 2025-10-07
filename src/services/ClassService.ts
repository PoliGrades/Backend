import { classTable, user as userTable } from "../database/schema.ts";
import { IClass } from "../interfaces/IClass.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { classSchema } from "../schemas/zodSchema.ts";
import { validateData } from "./decorators.ts";

export class ClassService {
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.db = db;
  }

  @validateData(classSchema)
  async createClass(classData: Partial<IClass>, userID: number): Promise<number> {
    classData = {
      ...classData,
    };

    // Check if user is a professor
    const user = await this.db.selectByField(userTable, "id", userID);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    if (user[0].role !== "PROFESSOR") {
      throw new Error("Only professors can create classes");
    }

    const newClass = await this.db.insert(classTable, {
      name: classData.name,
      subject: classData.subject,
      ownerId: userID,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IClass);
    if (!newClass) {
      throw new Error("There was an error creating your class");
    }

    return newClass.id;
  }

  async getAllClasses(): Promise<IClass[]> {
    return await this.db.selectAll(classTable);
  }

  async getClassById(id: number): Promise<IClass | null> {
    const classes = await this.db.selectByField(classTable, "id", id);
    return classes.length > 0 ? classes[0] : null;
  }

  async getClassesByOwnerId(ownerId: number): Promise<IClass[]> {
    return await this.db.selectByField(classTable, "ownerId", ownerId);
  }

  async updateClass(id: number, classData: Partial<IClass>, userId: number): Promise<void> {
    // Check if user is a professor
    const user = await this.db.selectByField(userTable, "id", userId);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    if (user[0].role !== "PROFESSOR") {
      throw new Error("Only professors can update classes");
    }

    const existingClass = await this.db.select(classTable, id);
    if (!existingClass) {
      throw new Error("Class not found");
    }

    if (existingClass.ownerId !== userId) {
      throw new Error("You can only update your own classes");
    }

    await this.db.update(classTable, id, {
      ...existingClass,
      ...classData,
      updatedAt: new Date(),
    } as IClass);

    return;
  }
}