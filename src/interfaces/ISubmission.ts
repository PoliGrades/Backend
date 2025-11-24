export interface ISubmission {
  id: number;
  taskId: number;
  studentId: number;
  hasAttachment: boolean;
  submittedAt: Date;
  graded: boolean;
  grade: string | null;
  feedback?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
