import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { io } from "../main.ts";

const orders = [
    {
        id: 1,
        name: 'Order 1',
        status: 'pending',
        items: [
            { id: 1, name: 'Item 1', quantity: 2 },
            { id: 2, name: 'Item 2', quantity: 1 },
        ],
        total: 20.0,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
]

const availableItems = [
    { id: 1, name: 'Hamburguer', price: 10.0 },
    { id: 2, name: 'Pizza', price: 5.0 },
    { id: 3, name: 'Salada', price: 15.0 },
]

export const cancelOrder = tool(
    ({ orderId }: { orderId: number }) => {
        const orderIndex = orders.findIndex(order => order.id === orderId);
        if (orderIndex === -1) {
            return `Pedido não encontrado.`;
        }

        orders.splice(orderIndex, 1);
        return `Pedido ${orderId} cancelado com sucesso!`;
    },
    {
        name: "cancelarPedido",
        description: "Cancela um pedido existente.",
        schema: z.object({
            orderId: z.number().describe("ID do pedido que deseja cancelar."),
        })
    }
)

export const createOrder = tool(
    async ({ items }: { items: string[] }) => {
        // Parse the items from the input, the input is a string with the item names
        const parsedItems = items.map(itemName => {
            const item = availableItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
            if (item) {
                return { id: item.id, name: item.name, quantity: 1, price: item.price };
            } else {
                return null;
            }
        }).filter(item => item !== null);

        if (parsedItems.length === 0) {
            return `Nenhum item encontrado.`;
        }
        
        const newOrder = {
            id: orders.length + 1,
            name: `Order ${orders.length + 1}`,
            status: 'pending',
            items: parsedItems,
            total: parsedItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        
        io.emit("message", JSON.stringify({
            type: "order",
            order: newOrder, 
        }));
    },
    {
        name: "criarPedido",
        description: "Cria um novo pedido com os itens especificados.",
        schema: z.object({
            items: z.array(z.string()).describe("Nome dos itens que deseja adicionar ao pedido."),
        })
    }
)

export const getOrder = tool(
    ({ orderId }: { orderId: number }) => {
        const order = orders.find(order => order.id === orderId);
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
        })
    }
)