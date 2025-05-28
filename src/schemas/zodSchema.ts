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

const orderItemSchema = z.object({
  id: z.number().describe("ID do item"),
  name: z.string().describe("Nome do item"),
  price: z.number().describe("Preço do produto"),
  quantity: z.number().describe("Quantidade"),
  observation: z.string().describe("Observações").optional(),
});

export const orderSchema = z.object({
  id: z.number().describe("ID do pedido").optional(),
  status: z.enum([
    "pending",
    "completed",
    "canceled",
    "paid"
  ]).describe("Status do pedido"),
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "pix",
    "cash",
  ]).describe("Método de pagamento").optional(),
  userId: z.number().describe("ID do usuário").optional(),
  items: z.array(orderItemSchema),
  total: z.number(),
  createdAt: z.date().describe("Data de criação do pedido"),
  updatedAt: z.date().describe("Data de atualização do pedido"),
});

export const productSchema = z.object({
  id: z.number().describe("ID do produto").optional(),
  name: z.string().describe("Nome do produto"),
  price: z.number().describe("Preço do produto"),
  type: z.string().describe("Tipo do produto"),
  description: z.string().describe("Descrição do produto").optional(),
  available: z.boolean().describe("Disponibilidade do produto"),
  createdAt: z.date().describe("Data de criação do produto"),
  updatedAt: z.date().describe("Data de atualização do produto"),
});
