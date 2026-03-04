"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt="avatar"
            width={24}
            height={24}
            className="rounded-full"
            style={{ border: "1px solid rgba(212,168,76,0.4)" }}
          />
        )}
        <button
          onClick={() => signOut()}
          className="text-[9px] tracking-[0.3em] uppercase transition-colors"
          style={{ color: "rgba(212,168,76,0.5)" }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" translate="no">
      <button
        onClick={() => signIn("google")}
        className="text-[9px] tracking-[0.3em] uppercase transition-colors hover:opacity-80"
        style={{
          color: "rgba(212,168,76,0.7)",
          border: "1px solid rgba(212,168,76,0.3)",
          padding: "4px 10px",
        }}
      >
        Google
      </button>
      <button
        onClick={() => signIn("line")}
        className="text-[9px] tracking-[0.3em] uppercase transition-colors hover:opacity-80"
        style={{
          color: "#06C755",
          border: "1px solid rgba(6,199,85,0.4)",
          padding: "4px 10px",
        }}
      >
        LINE
      </button>
    </div>
  );
}
