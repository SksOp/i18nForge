"use client";
import React from "react";
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (session) {
      console.log("Session data:", session);
      const accessToken = session;
      console.log("GitHub access token:", accessToken);
    }
  }, [session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    console.log("Authenticated user data:", session);
    return redirect("/home");
  }

  const handleSignIn = async () => {
    const result = await signIn();
    console.log("Sign in result:", result);
  };

  return (
    <div>
      <button onClick={handleSignIn}>Sign in</button>
    </div>
  );
}
