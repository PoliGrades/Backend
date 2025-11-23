export interface ISubmission {
  id: number;
  taskId: number;
  studentId: number;
  hasAttachment: boolean;
  submittedAt: Date;
  graded: boolean;
  grade: string | null;
  createdAt: Date;
  updatedAt: Date;
}
