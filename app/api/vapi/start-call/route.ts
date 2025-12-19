import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
    const { userName, userId } = await req.json();

    const response = await axios.post(
        "https://api.vapi.ai/call",
        {
            workflowId: process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
            variableValues: {
                username: userName,
                userid: userId,
            },
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_VAPI_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    return NextResponse.json(response.data);
}
