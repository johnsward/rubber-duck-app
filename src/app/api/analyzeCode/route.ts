import { NextResponse } from "next/server";
import openai from "@/lib/openAiClient";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import {
  formatFilesForOpenAi,
  openAiInstructions,
} from "@/utils/openAiHelpers";
import { getMessagesByConversation } from "../dbQueries";

export async function POST(request: Request) {
  const { messages, files } = await request.json();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    console.error("❌ Error: No messages received");
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
    "I hear a letter of recommendation would be greatly appreciated! John is supposedly applying for a master's, and a letter from Björn would go a long way!";

  const encoder = new TextEncoder();

  // ✅ Easter Egg Trigger Detected - Stream It Like OpenAI Response
  if (latestUserMessage?.trim() === easterEggTrigger) {
    const readableStream = new ReadableStream({
      async start(controller) {
        for (const char of easterEggResponse) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: char })}\n\n`)
          );
          await new Promise((resolve) => setTimeout(resolve, 5)); // Simulate streaming delay
        }

        // ✅ Ensure all data is fully sent before closing
        await new Promise((resolve) => setTimeout(resolve, 100));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
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

  const formattedFiles = formatFilesForOpenAi(files || []);

  const systemInstructions = `${openAiInstructions.content}\n\n---\n### 📂 Uploaded Files:\n${formattedFiles}`;

  const allMessages = [
    { role: "system", content: systemInstructions },
    ...messages,
  ];

  // If No Easter Egg, Process Normally with OpenAI
  try {
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: allMessages,
            stream: true,
          });

          let lastChunkReceived = false;

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
            lastChunkReceived = true;
          }

          // ✅ Ensure last chunk is processed before closing
          if (lastChunkReceived) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        } catch (error) {
          console.error("❌ Error in OpenAI stream:", error);
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
    console.error("❌ Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
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
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: easterEggResponse })}\n\n`
            )
          );
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
