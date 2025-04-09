"use client";
import React, { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { GithubRepos } from "@/components/github-repos";
export default function HomePage() {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    console.log("HomePage rendered");
    if (session) {
      console.log("Session data:", session);
    }
  }, []);

  return (
    <div>
      <div>HomePage</div>
      <button onClick={handleSignOut}>Sign out</button>
      <div className="">
        <button onClick={() => window.location.href = "/repositories"}>List all Repositories</button>
      </div>
    </div>
  );
}
