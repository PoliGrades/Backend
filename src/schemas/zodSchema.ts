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

export const classSchema = z.object({
  id: z.number().describe("ID da turma").optional(),
  name: z.string().describe("Nome da turma"),
  subject: z.string().describe("Disciplina da turma"),
  createdAt: z.date().describe("Data de criação da turma"),
  updatedAt: z.date().describe("Data de atualização da turma"),
});