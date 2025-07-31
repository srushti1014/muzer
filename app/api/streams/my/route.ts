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
  const stream = await prisma.stream.findMany({
    where: {
      userId: user.id ?? ""
    },
    include: {
      _count: {
        select: {
          upvotes: true
        }
      },
      upvotes: {
        where: {
          userId: user.id
        }
      }
    }
  })

  return NextResponse.json({
    stream: stream.map(({_count, ...rest}) => ({
      ...rest,
      upvotes: _count.upvotes,
      haveUpvoted: rest.upvotes.length ? true : false
    }))
  })
}