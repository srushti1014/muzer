import prisma from "@/lib/db";
import {NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();;
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