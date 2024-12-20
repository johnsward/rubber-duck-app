import { supabase } from "@/lib/supabaseClient";
import { getConversationsByUser } from "../dbQueries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const userId = request.headers.get("user_id");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required!" },
      { status: 400 }
    );
  }

  try {
    const conversations = await getConversationsByUser(userId);
    return NextResponse.json(conversations, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, title } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id,
        title: title || "Untitled conversation",
        created_at: new Date(),
      })
      .select();

    if (error) {
      throw Error;
    }
    return NextResponse.json({ conversations: data[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
