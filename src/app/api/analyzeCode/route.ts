import { NextResponse } from "next/server";
import openai from "@/lib/openAiClient";

export async function POST(request: Request) {
    const { code } = await request.json();

    if (!code) {
        return NextResponse.json({error: "Code is required"}, {status: 404});
    }

    try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant for a code debugging application." },
            { role: "user", content: `Here is the code I want you to help me debug:\n\n${code}` },
          ],
        });
    
        return NextResponse.json({
          response: response.choices[0].message?.content || "No response from the Debug Duck!",
        });
      } catch (error) {
        console.error("Error analyzing code:", error);
        return NextResponse.json({ error: "There was an error analyzing the code." }, { status: 500 });
      }
};