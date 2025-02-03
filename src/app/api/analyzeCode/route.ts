import { NextResponse } from "next/server";
import openai from "@/lib/openAiClient";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { openAiInstructions } from "@/utils/openAiHelpers";
import { getMessagesByConversation } from "../dbQueries";

export async function POST(request: Request) {
  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Messages are required" },
      { status: 400 }
    );
  }

  const latestUserMessage = messages
    .filter((msg) => msg.role === "user")
    .pop()?.content;

  const easterEggTrigger = "How can Björn Svensson help John?";
  const easterEggResponse =
    "I hear a letter of recommendation would be greatly appreciated! John is supposedly applying for a masters, and a letter from Björn would go a long way!";

  if (latestUserMessage && latestUserMessage.trim() === easterEggTrigger) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${easterEggResponse}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  try {
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const allMessages = [
            { role: "system", content: openAiInstructions.content },
            ...messages,
          ];

          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: allMessages,
            stream: true,
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              // Serialize the content as a JSON object
              const serializedContent = JSON.stringify({ content });
              controller.enqueue(
                encoder.encode(`data: ${serializedContent}\n\n`)
              );
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Error in OpenAI stream:", error);
          const errorMessage = JSON.stringify({ error: "Streaming failed." });
          controller.enqueue(encoder.encode(`data: ${errorMessage}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error processing OpenAI request:", error);
    return NextResponse.json(
      { error: "There was an error processing your request." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return new Response("Conversation ID is required", { status: 400 });
  }

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const conversationMessages = await getMessagesByConversation(
          conversationId
        );
        const messages: ChatCompletionMessageParam[] = conversationMessages.map(
          (msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.message_text,
          })
        );

        // Identify the latest user message for Easter Egg logic
        const latestUserMessage = messages
          .filter((msg) => msg.role === "user")
          .pop()?.content;

        const easterEggTrigger = "How can Björn Svensson help John?";
        const easterEggResponse =
          "I hear a letter of recommendation would be greatly appreciated! John is supposedly applying for a master's, and a letter from Björn would go a long way!";

        if (
          latestUserMessage &&
          typeof latestUserMessage === "string" &&
          latestUserMessage.trim() === easterEggTrigger
        ) {
          controller.enqueue(encoder.encode(`data: ${easterEggResponse}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }
        // Fetch all messages for the given conversation ID

        if (!conversationMessages || conversationMessages.length === 0) {
          controller.enqueue(
            encoder.encode("data: No conversation history found.\n\n")
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        // Call OpenAI with the full conversation history
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: openAiInstructions.content },
            ...messages,
          ],
          stream: true,
        });

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            const serializedContent = JSON.stringify({ content });
            controller.enqueue(
              encoder.encode(`data: ${serializedContent}\n\n`)
            );
          }
        }

        // Signal completion
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Error in SSE stream:", error);
        controller.enqueue(encoder.encode("data: [ERROR]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
