"use client";

import { useUser, SignIn } from "@clerk/nextjs";
import Loading from "@/components/shared/Loading";
import { useEffect } from "react";

export default function Home() {
  const { isLoaded } = useUser();

  useEffect(() => {
    isLoaded &&
      (async () => {
        await fetch("/api/v1/users", { method: "POST" });
      })();
  }, [isLoaded]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {!isLoaded ? (
        <Loading />
      ) : (
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      )}
    </div>
  );
}
