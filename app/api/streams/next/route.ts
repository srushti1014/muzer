import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      }
    );
  }
  //tream with the highest number of upvotes that belongs to the user.
  const mostUpvotedStream = await prisma.stream.findFirst({
    where: {
      userId: user.id,
      played: false
    },
    orderBy: {
      upvotes: {
        _count: "desc",
      },
    },
  });

  //Update currentStream and delete that stream
  await Promise.all([
    prisma.currentStream.upsert({
      where: {
        userId: user.id,
      },
      update: {
        userId: user.id,
        streamId: mostUpvotedStream?.id,
      },
      create: {
        userId: user.id,
        streamId: mostUpvotedStream?.id,
      }
    }),
    prisma.stream.update({
      where: {
        id: mostUpvotedStream?.id ?? "",
      },
      data: {
        played: true,
        playedTs: new Date(),
      },
    }),
  ]);

    //upsert:
// If a row exists with userId, it updates its streamId.
// If not, it creates one.

  return NextResponse.json({
    stream: mostUpvotedStream,
  });
}
