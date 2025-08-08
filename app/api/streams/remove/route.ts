import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest) {
  const session = await auth()

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
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");
    const spaceId = searchParams.get('spaceId')

    if (!streamId) {
      return NextResponse.json(
        {
          message: "Stream ID is required",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.stream.delete({
      where: {
        id: streamId,
        userId: user.id,
        spaceId:spaceId
      },
    });

    return NextResponse.json({
      message: "Song removed successfully",
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Error while removing the song",
      },
      {
        status: 400,
      },
    );
  }
}