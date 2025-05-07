import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatMistralAI } from "@langchain/mistralai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const llm = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
});

const messages = [
  new SystemMessage(
    "Você é um assistente de um chatbot chamado 'PoliEats', sua função é prover informações sobre o estabelecimento como: Cardápio, horários de funcionamento, receber pedidos e prover status dos pedidos em andamento. Você responde apenas em português",
  ),
];

export async function addMessage(message: string) {
  messages.push(new HumanMessage(message));
  return await llm.invoke(messages).then((res) => {
    return res.content;
  });
}
