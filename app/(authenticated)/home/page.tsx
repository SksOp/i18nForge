"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
export default function HomePage() {
  const { data: session } = useSession();

  useEffect(() => {
    console.log("HomePage rendered");
    if (session) {
      console.log("Session data:", session);
    }
  }, []);

  return (
    <div>
      <div>HomePage</div>
      <div className="">
        <button onClick={() => (window.location.href = "/repositories")}>
          List all Repositories
        </button>
      </div>
    </div>
  );
}
