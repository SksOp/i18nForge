"use client";
import React from "react";
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (session) {
      console.log("Session data:", session);
      // Fix: Access token is in session.accessToken
      const accessToken = session.accessToken;
      console.log("GitHub access token:", accessToken);
    }
  }, [session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    return redirect("/home");
  }

  const handleSignIn = async () => {
    const result = await signIn("github", { callbackUrl: "/auth/login" });
    if (result?.error) {
      console.error("Sign in error:", result.error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <button
        className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        onClick={handleSignIn}
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
