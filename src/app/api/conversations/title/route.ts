import { NextResponse } from "next/server";
import openai from "@/lib/openAiClient";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Generate a concise and descriptive title for the following code or conversation. The title must be less than 5 words`,
        },
        { role: "user", content: message },
      ],
    });

    const title = openaiResponse.choices[0]?.message?.content?.trim();
    return NextResponse.json({ title: title || "Untitled Conversation" });
  } catch (error) {
    console.error("Error generating conversation title:", error);
    return NextResponse.json(
      { error: "Failed to generate conversation title" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const userId = request.headers.get("user_id");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required to fetch conversations." },
      { status: 400 }
    );
  }

  try {
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching conversations:", error);
      NextResponse.json(
        { error: "Failed to fetch conversations." },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error: any) {
    console.error("Unexpected error:", error.message);
    NextResponse.json(
      { error: "An unexpected error occurred while fetching conversations." },
      { status: 500 }
    );
  }
};
