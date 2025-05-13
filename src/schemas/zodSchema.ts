import z from "zod";

export const userSchema = z.object({
  id: z.number().describe("ID do usuário").optional(),
  name: z.string().describe("Nome do usuário"),
  email: z.string().email().describe("Email do usuário"),
  document: z.string().refine(
    (value) => {
      const regex = /^\d{3}.?\d{3}.?\d{3}\-?\d{2}$/;
      return regex.test(value);
    },
  ).transform((value) => value.replace(/\D/g, "")).describe(
    "Documento do usuário",
  ),
  createdAt: z.date().describe("Data de criação do usuário"),
  updatedAt: z.date().describe("Data de atualização do usuário"),
});
