import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const { userId, creatorId } = await req.json();

  const token = jwt.sign(
    {
      creatorId,
      userId,
    },
    process.env.NEXT_PUBLIC_SECRET || "",
    {
      expiresIn: "24h",
    }
  );

  return NextResponse.json({ token });
}
