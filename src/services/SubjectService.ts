import { subject as subjectTable } from "../database/schema.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { ISubject } from "../interfaces/ISubject.ts";
import { subjectSchema } from "../schemas/zodSchema.ts";
import { validateData } from "./decorators.ts";

export class SubjectService {
    private db: IDatabase;

    constructor(db: IDatabase) {
        this.db = db;
    }

    @validateData(subjectSchema)
    async createSubject(
        subjectData: Partial<ISubject>,
    ): Promise<number> {
        subjectData = {
            ...subjectData,
        };

        // Check if a subject with the same name already exists
        const existingSubjects = await this.db.selectByField(
            subjectTable,
            "name",
            subjectData.name!,
        );

        if (existingSubjects.length > 0) {
            throw new Error("A subject with this name already exists");
        }

        const newSubject = await this.db.insert(subjectTable, {
            name: subjectData.name,
            description: subjectData.description,
            color: subjectData.color,
            icon: subjectData.icon,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as ISubject);
        if (!newSubject) {
            throw new Error("There was an error creating your subject");
        }

        return newSubject.id;
    }

    async getAllSubjects(): Promise<ISubject[]> {
        return await this.db.selectAll(subjectTable);
    }

    async getSubjectById(id: number): Promise<ISubject | null> {
        const subjects = await this.db.selectByField(subjectTable, "id", id);
        return subjects.length > 0 ? subjects[0] : null;
    }
}