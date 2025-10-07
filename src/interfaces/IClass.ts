/**
 * Interface para representar uma turma.
 * Inclui propriedades como id, name, subject, createdAt e updatedAt.
 */

export interface IClass {
  id: number;
  name: string;
  subject: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}