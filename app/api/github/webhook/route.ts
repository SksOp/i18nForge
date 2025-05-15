import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { InstallationPayload, installation } from "./events/installation";

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const githubEvent = headersList.get("x-github-event");

    const payload_text = await req.text();
    const payload = JSON.parse(payload_text);
    console.log("githubEvent", githubEvent);

    // Forward event to smee.io

    // Handle different webhook events
    switch (githubEvent) {
      case "installation":
        await installation(payload as unknown as InstallationPayload);
        break;
      case "pull_request":
        // Handle pull request event
        console.log("Received pull request event");
        break;
    }

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
