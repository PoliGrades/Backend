import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { IOrder } from "../interfaces/IOrder.ts";
import { io, orderHandler, pendingConfirmation } from "../main.ts";

const availableItems = [
  { id: 1, name: "Hamburguer", price: 10.0 },
  { id: 2, name: "Pizza", price: 5.0 },
  { id: 3, name: "Salada", price: 15.0 },
];

export const createOrder = tool(
  async ({ items, userId }: {
    items: {
      name: string;
      quantity: number;
      observation?: string;
    }[];
    userId: number;
  }) => {
    const parsedItems = items.map((itemName) => {
      const item = availableItems.find((i) =>
        i.name.toLowerCase() === itemName.name.toLowerCase()
      );
      if (item) {
        return {
          id: item.id,
          name: item.name,
          quantity: itemName.quantity,
          price: item.price,
          observation: itemName.observation,
        };
      } else {
        return null;
      }
    }).filter((item) => item !== null);

    if (parsedItems.length === 0) {
      return `Nenhum item encontrado.`;
    }

    const newOrder: IOrder = {
      id: Math.floor(Math.random() * 10000),
      userId: Number(userId),
      status: "pending",
      items: parsedItems,
      total: parsedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    io.emit(
      "message",
      JSON.stringify({
        type: "order",
        order: newOrder,
      }),
    );

    const isConfirmed = await new Promise((resolve) => {
      pendingConfirmation.set(newOrder.id, { resolve });

      setTimeout(() => {
        if (pendingConfirmation.has(newOrder.id)) {
          pendingConfirmation.delete(newOrder.id);
          resolve(false);
        }
      }, 30000);
    });

    if (isConfirmed) {
      try {
        const result = await orderHandler.createOrder(newOrder, userId);

        if (result.status !== 201) {
          return `Ocorreu um erro ao processar o seu pedido, por favor, tente novamente mais tarde`;
        }

        io.emit(
          "new_order",
          JSON.stringify({
            newOrder: {
              ...newOrder,
              id: result.data,
            },
          }),
        );

        return `Pedido ${result.data} criado com sucesso!`;
      } catch (_err: unknown) {
        return `Ocorreu um erro ao processar o seu pedido, por favor, tente novamente mais tarde`;
      }
    } else {
      return `Pedido ${newOrder.id} não confirmado.`;
    }
  },
  {
    name: "criarPedido",
    description: "Cria um novo pedido com os itens especificados.",
    schema: z.object({
      items: z.array(
        z.object({
          name: z.string().describe("Nome do item"),
          quantity: z.number().describe("Quantidade do determinado item"),
          observation: z.string().optional().describe(
            "Observações sobre o item",
          ),
        }),
      ).describe(
        "Uma lista contendo as informações de cada item, como: nome do item, quantidade desse item e alguma possível observação",
      ),
      userId: z.number().describe("O id do usuário que fez a requisição"),
    }),
  },
);

export const getOrder = tool(
  ({ orderId, userId }: { orderId: number; userId: number }) => {
    const order = orderHandler.getOrderById(orderId, userId);
    if (!order) {
      return `Pedido não encontrado.`;
    }
    return `Pedido encontrado: ${JSON.stringify(order)}`;
  },
  {
    name: "verPedido",
    description: "Verifica o status de um pedido.",
    schema: z.object({
      orderId: z.number().describe("ID do pedido que deseja verificar."),
      userId: z.number().describe("O id do usuário que fez a requisição"),
    }),
  },
);

export const getOrders = tool(
  async ({ userId }: { userId: number }) => {
    const orders = await orderHandler.getOrdersByUserId(userId);
    if (orders.data.length === 0) {
      return `Nenhum pedido encontrado.`;
    }
    return `Pedidos encontrados: ${JSON.stringify(orders.data)}`;
  },
  {
    name: "verPedidos",
    description: "Verifica todos os pedidos de um usuário.",
    schema: z.object({
      userId: z.number().describe("O id do usuário que fez a requisição"),
    }),
  },
);
