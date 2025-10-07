/**
 * User Interface
 * This interface defines the structure of a user object.
 * It includes properties such as id, name, email, document, createdAt, and updatedAt.
 */

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: "PROFESSOR" | "STUDENT";
  createdAt: Date;
  updatedAt: Date;
}
