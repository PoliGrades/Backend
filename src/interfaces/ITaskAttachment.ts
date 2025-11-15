export interface ITaskAttachment {
  id: number;
  taskId: number;
  fileName: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}
