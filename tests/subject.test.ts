import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { MockDatabase } from "../src/database/MockDatabase.ts";
import { generateMockSubject } from "../src/mocks/Subject.ts";
import { generateMockPassword, generateMockUser } from "../src/mocks/User.ts";
import { AuthenticationService } from "../src/services/AuthenticationService.ts";
import { SubjectService } from "../src/services/SubjectService.ts";

describe("Subject service", () => {
  let db: MockDatabase;

  let subjectService: SubjectService;

  beforeAll(async () => {
    db = new MockDatabase();
    const authenticationService = new AuthenticationService(db);
    subjectService = new SubjectService(db);

    const newUser = generateMockUser("PROFESSOR");
    const userPassword = generateMockPassword();

    await authenticationService.registerUser(newUser, userPassword);
  });

  it("should create a new subject", async () => {
    const subjectData = generateMockSubject();

    const newSubjectId = await subjectService.createSubject(subjectData);

    const newSubject = await subjectService.getSubjectById(newSubjectId);
    
    expect(newSubject).toBeDefined();
    expect(newSubject?.name).toBe(subjectData.name);
  });

  it("should retrieve all subjects", async () => {
    for (let i = 0; i < 3; i++) {
      await subjectService.createSubject(generateMockSubject());
    }
   
    const subjects = await subjectService.getAllSubjects();

    expect(subjects).toBeDefined();
    expect(subjects.length).toBeGreaterThan(0);
  });

  it("should retrieve a subject by id", async () => {
    const subjectData = generateMockSubject();
    const newSubjectId = await subjectService.createSubject(subjectData);

    const retrievedSubject = await subjectService.getSubjectById(newSubjectId);

    expect(retrievedSubject).toBeDefined();
    expect(retrievedSubject?.name).toBe(subjectData.name);
  });

  it("should return null for non-existing subject id", async () => {
    const retrievedSubject = await subjectService.getSubjectById(9999);
    expect(retrievedSubject).toBeNull();
  });
});