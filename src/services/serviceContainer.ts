import { MockDatabase } from "../database/MockDatabase.ts";
import { PostgresDatabase } from "../database/PostgresDatabase.ts";
import { IDatabase } from "../interfaces/IDatabase.ts";
import { ValidateJWT } from "../middlewares/ValidateJWT.ts";
import { AuthenticationService } from "../services/AuthenticationService.ts";
import { ChatService } from "../services/ChatService.ts";
import { ClassService } from "../services/ClassService.ts";
import { SubjectService } from "../services/SubjectService.ts";
import { TaskAttachmentService } from "../services/TaskAttachmentService.ts";
import { TaskService } from "../services/TaskService.ts";
import { WarningService } from "../services/WarningService.ts";
import { SubmissionAttachmentService } from "./SubmissionAttachmentService.ts";

export interface Services {
  db: IDatabase;
  authenticationService: AuthenticationService;
  jwtMiddleware: ValidateJWT;
  chatService: ChatService;
  warningService: WarningService;
  taskAttachmentService: TaskAttachmentService;
  classService: ClassService;
  taskService: TaskService;
  subjectService: SubjectService;
}

export function createServices(
  environment: string,
  secretKey?: string,
): Services {
  let db: IDatabase;

  switch (environment) {
    case "production":
      console.log("Running in production mode");
      db = new PostgresDatabase();
      break;
    case "development":
      console.log("Running in development mode");
      db = new MockDatabase();
      break;
    default:
      console.log("Running in default (mock) mode");
      db = new MockDatabase();
      break;
  }

  const authenticationService = new AuthenticationService(db, secretKey);
  const jwtMiddleware = new ValidateJWT(authenticationService);

  const chatService = new ChatService();
  const warningService = new WarningService();
  const taskAttachmentService = new TaskAttachmentService();
  const submissionAttachmentService = new SubmissionAttachmentService();

  const classService = new ClassService(db);
  const taskService = new TaskService(
    db,
    classService,
    taskAttachmentService,
    submissionAttachmentService,
  );
  const subjectService = new SubjectService(db, classService);

  return {
    db,
    authenticationService,
    jwtMiddleware,
    chatService,
    warningService,
    taskAttachmentService,
    classService,
    taskService,
    subjectService,
  };
}
