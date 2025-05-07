// deno-lint-ignore-file
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ChatMistralAI } from "@langchain/mistralai";
import { z } from "zod";

const llm = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0
});

interface RestaurantMenu {
  name: string;
  menu: Array<{ item: string; price: number }>;
}

const restaurantMenus: RestaurantMenu[] = [
    {
        name: "Pizza Place",
        menu: [
        { item: "Margherita Pizza", price: 10 },
        { item: "Pepperoni Pizza", price: 12 },
        { item: "Veggie Pizza", price: 11 },
        ],
    },
    {
        name: "Burger Joint",
        menu: [
        { item: "Cheeseburger", price: 8 },
        { item: "Veggie Burger", price: 7 },
        { item: "Double Burger", price: 10 },
        ],
    },
]

const getRestaurantMenu = tool(
  async ({ restaurant_name }) => {
    const restaurant = restaurantMenus.find(
      (menu) => menu.name.toLowerCase() === restaurant_name.toLowerCase()
    );
    if (!restaurant) {
      throw new Error(`Restaurant ${restaurant_name} not found.`);
    }
    return `Menu for ${restaurant.name}: ${restaurant.menu.map(item => `${item.item} - $${item.price}`).join(", ")}`;
  }
  ,
    {
        name: "get_restaurant_menu",
        schema: z.object({
        restaurant_name: z.string(),
        }),
        description: "Get the menu of a restaurant.",
    }
);

const tools = [getRestaurantMenu];

const llmWithTools = llm.bindTools(tools);

const messages = [new HumanMessage("What is the menu of Pizza Place?")];

const aiMessage = await llmWithTools.invoke(messages);

console.log(aiMessage);

messages.push(aiMessage);

const toolsByName = {
    get_restaurant_menu: getRestaurantMenu,
  };
  
  for (const toolCall of aiMessage.tool_calls) {
    const selectedTool = toolsByName[toolCall.name];
    const toolMessage = await selectedTool.invoke(toolCall);
    messages.push(toolMessage);
  }
  
  console.log(messages);

  const final = await llmWithTools.invoke(messages);
  console.log(final);