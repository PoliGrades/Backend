export interface ISubmissionAttachment {
  id: number;
  submissionId: number;
  fileName: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}
