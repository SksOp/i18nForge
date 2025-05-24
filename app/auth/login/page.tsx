"use client";
import React from "react";
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Github, GitlabIcon, Mail } from "lucide-react";
import Spinner from "@/components/spinner";

export default function LoginPage() {
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (session) {
      // console.log("Session data:", session);
      const accessToken = session.accessToken;
      // console.log("GitHub access token:", accessToken);
    }
  }, [session]);
  // console.log(status);
  if (status === "loading") {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex item-center justify-center">
          <img src="/logo.svg" alt="Logo" className="h-6 w-6 object-cover" />
        </div>
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">
              Log in to i18nForge
            </CardTitle>
            <CardDescription className="text-gray-500 text-center">
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full bg-white border-gray-200 hover:bg-gray-50 text-gray-800 flex items-center justify-center gap-2 h-11"
                onClick={handleSignIn}
              >
                <Github className="h-4 w-4" />
                <span>Continue with GitHub</span>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-center text-gray-500 flex justify-center">
            <p>
              By continuing, you agree to i18nForge's{" "}
              <a href="#" className="underline hover:text-gray-700">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-gray-700">
                Privacy Policy
              </a>
            </p>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            Don't have an account?{" "}
            <a href="#" className="text-gray-700 hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
