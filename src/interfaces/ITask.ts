export interface ITask {
  id: number;
  classId: number;
  title: string;
  description: string;
  hasAttachment: boolean;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
