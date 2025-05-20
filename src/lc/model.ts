import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatMistralAI } from "@langchain/mistralai";
import { DynamicStructuredTool } from "npm:@langchain/core/tools";
import { createOrder, getOrder, getOrders } from "./tools.ts";

const llm = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
});

const tools: DynamicStructuredTool[] = [getOrder, createOrder, getOrders];

const llmWithTools = llm.bindTools(tools);

const messages = [
  new SystemMessage(
    "Você é um assistente de um chatbot chamado 'PoliEats', sua função é prover informações sobre o estabelecimento como: Cardápio, horários de funcionamento, receber pedidos e prover status dos pedidos em andamento. Você responde apenas em português. Você tem permissão para se adequar ao perfil do usuário, utilizando gírias e expressões populares.",
  ),
];

const toolsByName = tools.reduce((acc, tool) => {
  acc[tool.name] = tool;
  return acc;
}, {} as Record<string, typeof tools[number]>);

export async function addMessage({message, user}: {message: string; user: {id: number; name: string}}) {
  // Send the message to the LLM
  messages.push(new HumanMessage(`{message: ${message}, user: ${user.name}, id: ${user.id}}`));

  const firstResponse = await llmWithTools.invoke(messages);

  // Check if the response contains a tool call
  if (firstResponse.tool_calls && firstResponse.tool_calls.length > 0) {
    messages.push(firstResponse);
    for (const toolCall of firstResponse.tool_calls) {
      const selectedTool = toolsByName[toolCall.name];
      const toolMessage = await selectedTool.invoke(toolCall);
      messages.push(toolMessage);
    }

    // Add the final response to the messages
    const finalResponse = await llmWithTools.invoke(messages);
    messages.push(finalResponse);

    console.log(messages);
    return JSON.stringify({
      type: "response",
      message: finalResponse.content,
    });
  } else {
    console.log(messages);
    messages.push(firstResponse);
    return JSON.stringify({
      type: "response",
      message: firstResponse.content,
    });
  }
}
