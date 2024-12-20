import { NextResponse } from "next/server";
import openai from "@/lib/openAiClient";

export async function POST(request: Request) {
  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Messages are required" },
      { status: 400 }
    );
  }

  const latestUserMessage = messages
    .filter((msg) => msg.role == "user")
    .pop()?.content;

  const easterEggTrigger = "How can Björn Svensson help John?";
  const easterEggResponse =
    "I hear a letter of recommendation would be greatly appreciated! John is supposedly applying for a masters, and a letter from Björn would go a long way!";

  if (latestUserMessage && latestUserMessage.trim() === easterEggTrigger) {
    return NextResponse.json({ response: easterEggResponse });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages, // Pass the full conversation history
    });

    return NextResponse.json({
      response:
        response.choices[0]?.message?.content ||
        "No response from the Debug Duck!",
    });
  } catch (error) {
    console.error("Error processing OpenAI request:", error);
    return NextResponse.json(
      { error: "There was an error processing your request." },
      { status: 500 }
    );
  }
}
