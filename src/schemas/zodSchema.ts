import z from "zod";

export const userSchema = z.object({
  id: z.number().describe("ID do usuário").optional(),
  name: z.string().describe("Nome do usuário"),
  email: z.string().email().describe("Email do usuário").refine((email) => {
    return email.endsWith("@p4ed.com.br");
  }, {
    message: "O email deve ser do domínio @p4ed.com.br",
  }),
  role: z.enum(["PROFESSOR", "STUDENT"]).describe("Papel do usuário"),
  createdAt: z.date().describe("Data de criação do usuário"),
  updatedAt: z.date().describe("Data de atualização do usuário"),
});

export const subjectSchema = z.object({
  id: z.number().describe("ID da disciplina").optional(),
  name: z.string().describe("Nome da disciplina"),
  description: z.string().describe("Descrição da disciplina"),
  color: z.string().describe("Cor da disciplina"),
  accentColor: z.string().describe("Cor de destaque da disciplina"),
  createdAt: z.date().describe("Data de criação da disciplina"),
  updatedAt: z.date().describe("Data de atualização da disciplina"),
});

export const classSchema = z.object({
  id: z.number().describe("ID da turma").optional(),
  name: z.string().describe("Nome da turma"),
  subjectId: z.number().describe("ID da disciplina"),
  createdAt: z.date().describe("Data de criação da turma"),
  updatedAt: z.date().describe("Data de atualização da turma"),
});

export const taskSchema = z.object({
  id: z.number().describe("ID da tarefa").optional(),
  classId: z.number().describe("ID da turma"),
  title: z.string().describe("Título da tarefa"),
  description: z.string().describe("Descrição da tarefa"),
  dueDate: z.date().describe("Data de entrega da tarefa"),
  createdAt: z.date().describe("Data de criação da tarefa"),
  updatedAt: z.date().describe("Data de atualização da tarefa"),
});

export const gradeSchema = z.object({
  id: z.number().describe("ID da nota").optional(),
  taskId: z.number().describe("ID da tarefa"),
  studentId: z.number().describe("ID do estudante"),
  grade: z.number().describe("Nota do estudante"),
  createdAt: z.date().describe("Data de criação da nota"),
  updatedAt: z.date().describe("Data de atualização da nota"),
});

export const messageSchema = z.object({
  room_id: z.string().describe("ID da sala de chat"),
  sender_id: z.number().describe("ID do remetente"),
  sender_role: z.enum(["STUDENT", "PROFESSOR"]).describe("Papel do remetente"),
  sender_name: z.string().describe("Nome do remetente"),
  message: z.string().describe("Conteúdo da mensagem"),
  timestamp: z.date().describe("Timestamp da mensagem"),
});
