import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const GET = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
  }

  return NextResponse.json({ user: session.user });
};

export const dynamic = "force-dynamic";
