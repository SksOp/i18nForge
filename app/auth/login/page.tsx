"use client";
import React from "react";
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    return redirect("/home");
  }

  return (
    <div>
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );
}
