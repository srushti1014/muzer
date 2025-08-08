import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      },
    );
  }
  const user = session.user;
  const data = await req.json()

  try {
    await prisma.stream.updateMany({
      where: {
        userId: user.id,
        played: false,
        spaceId:data.spaceId
      },
      data: {
        played: true,
        playedTs: new Date(),
      },
    });

    return NextResponse.json({
      message: "Queue emptied successfully",
    });
  } catch (error) {
    console.error("Error emptying queue:", error);
    return NextResponse.json(
      {
        message: "Error while emptying the queue",
      },
      {
        status: 500,
      },
    );
  }
}