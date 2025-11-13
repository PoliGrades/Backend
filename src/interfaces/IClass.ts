/**
 * Interface para representar uma turma.
 * Inclui propriedades como id, name, subject, createdAt e updatedAt.
 */

export interface IClass {
  id: number;
  name: string;
  subjectId: number;
  ownerId: number;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
}
