import { NextRequest, NextResponse } from "next/server";
import { MetaUtils } from "./meta.utils";
import { useSession } from "next-auth/react";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import {
    MetaOperationRequest,
    CommitResponse,
    PullRequestResponse,
} from "./types";



export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response("Session not found", { status: 401 });
        }
        const accessToken = session.accessToken;
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await request.json()) as MetaOperationRequest;
        const {
            operation,
            owner,
            repo,
            branch,
            path,
            content,
            message,
            title,
            body: prBody,
        } = body;

        if (!owner || !repo) {
            return NextResponse.json(
                { error: "Owner and repo are required" },
                { status: 400 }
            );
        }
        if (!title || !prBody) {
            return NextResponse.json(
                { error: "Title and body are required for pull request" },
                { status: 400 }
            );
        }
        let result: CommitResponse | PullRequestResponse | null;
        switch (operation) {
            case "commit":
                if (!path || !content || !message) {
                    return NextResponse.json(
                        { error: "Path, content, and message are required for commit" },
                        { status: 400 }
                    );
                }
                const commitBranch = branch || `feature/${Date.now()}`;
                const branchResult = await MetaUtils.createBranch(
                    accessToken,
                    owner,
                    repo,
                    commitBranch
                );

                if (!branchResult) {
                    return NextResponse.json(
                        { error: "Failed to create branch" },
                        { status: 500 }
                    );
                }

                result = (await MetaUtils.commitContent(
                    accessToken,
                    owner,
                    repo,
                    commitBranch,
                    path,
                    content,
                    message
                )) as CommitResponse;

                if (!result) {
                    return NextResponse.json(
                        { error: "Failed to commit content" },
                        { status: 500 }
                    );
                }

                result = (await MetaUtils.createPullRequest(
                    accessToken,
                    owner,
                    repo,
                    commitBranch,
                    title,
                    prBody
                )) as PullRequestResponse;
                break;

            default:
                return NextResponse.json(
                    { error: "Invalid operation" },
                    { status: 400 }
                );
        }
        if (!result) {
            return NextResponse.json({ error: "Operation failed" }, { status: 500 });
        }
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in meta operation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
