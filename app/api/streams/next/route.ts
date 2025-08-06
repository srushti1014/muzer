import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();;
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
  const spaceId = req.nextUrl.searchParams.get("spaceId");
  const mostUpvotedStream = await prisma.stream.findFirst({
    where: {
      userId: user.id,
      played: false,
      spaceId: spaceId
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
        spaceId: spaceId
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
