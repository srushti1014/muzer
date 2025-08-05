import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { json } from "zod";

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Login to create space" },
        { status: 401 }
      );
    }

    const data = await req.json();
    console.log(data);

    if (!data.spaceName) {
      return NextResponse.json(
        { success: false, message: "Space name is required" },
        { status: 400 }
      );
    }
    const space = await prisma.space.create({
      data: {
        name: data.spaceName,
        hostId: session.user.id,
      },
    });

    return NextResponse.json(
      { success: true, message: "Space created", space },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: `An unexpected error occurred: ${err.message}`,
      },
      { status: 500 }
    );
  }
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Login to create space" },
        { status: 401 }
      );
    }

    const spaceId = req.nextUrl.searchParams.get("spaceId");
    console.log("-=====---",spaceId)

    // If spaceId exist return the hostId
    if (spaceId) {
      const space = await prisma.space.findUnique({
        where: { id: spaceId },
        select: { hostId: true },
      });

      if (!space) {
        return NextResponse.json(
          { success: false, message: "Space not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Host ID retrieved successfully",
          hostId: space.hostId,
        },
        { status: 200 }
      );
    }

    // If no spaceId is provided, retrieve all spaces
    const spaces = await prisma.space.findMany({
      where: {
        hostId: session.user.id,
      },
    });
    return NextResponse.json(
      { success: true, message: "Spaces retrieved successfully", spaces },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: `An unexpected error occurred: ${err.message}`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const spaceId = req.nextUrl.searchParams.get("spaceId");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to delete a space" },
        { status: 401 }
      );
    }

    if (!spaceId) {
      return NextResponse.json(
        { success: false, message: "Space Id is required" },
        { status: 401 }
      );
    }
    console.log(spaceId);
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
    });

    if (!space) {
      return NextResponse.json(
        { success: false, message: "Space not found" },
        { status: 404 }
      );
    }

    if (space.hostId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to delete this space",
        },
        { status: 403 }
      );
    }

    await prisma.space.delete({
      where: { id: spaceId },
    });

    return NextResponse.json(
      { success: true, message: "Space deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: `An unexpected error occurred: ${err.message}`,
      },
      { status: 500 }
    );
  }
}
