import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const UpvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user.id) {
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

  try {
    const data = UpvoteSchema.parse(await req.json());
    await prisma.upvote.delete({
      where: {
        userId_streamId: {
          userId: user.id,
          streamId: data.streamId,
        },
      },
    });
    return NextResponse.json({
      message: "Done"
    })
  } catch (e) {
    return NextResponse.json(
      {
        message: "Error in upvoting",
      },
      {
        status: 411,
      }
    );
  }
}
