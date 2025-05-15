import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/auth";

export async function getAuthenticatedUser(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const userEmail = request.headers.get("x-user-email");
  const userAccessToken = request.headers.get("x-user-accessToken");
  if (!userId || !userEmail) {
    return null;
  }

  return {
    id: userId,
    email: userEmail,
    accessToken: userAccessToken,
  };
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session.user;
}
