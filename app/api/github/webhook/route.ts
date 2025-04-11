import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    console.log("Received GitHub webhook");
    const headersList = await headers();
    const githubEvent = headersList.get("x-github-event");

    const payload = await req.text();
    // const secret = process.env.GITHUB_SECRET;

    // if (!secret) {
    //   return NextResponse.json(
    //     { error: "Webhook secret not configured" },
    //     { status: 500 }
    //   );
    // }

    console.log("githubEvent", githubEvent);
    console.log("payload", payload);

    // Handle different webhook events
    switch (githubEvent) {
      case "installation":
        console.log("Received installation event");
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
