import prisma from "@/lib/db";
import { YT_REGEX } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import yts from "yt-search";
import { getServerSession } from "next-auth";
// import youtubesearchapi from "youtube-search-api";
// import { getServerSession } from "next-auth";

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

// const MAX_QUEUE_LEN = 20;

export async function POST(req: NextRequest) {
  try {
    // const session = await getServerSession();
    // const user = session?.user;
    // console.log("dataaaaaa:", await req.json())

    const data = CreateStreamSchema.parse(await req.json());
    const isYt = data.url.match(YT_REGEX);
    const videoId = data.url.match(YT_REGEX)?.[1];
    console.log(videoId);
    if (!isYt || !videoId) {
      return NextResponse.json(
        {
          message: "Invalid YouTube URL format",
        },
        {
          status: 400,
        }
      );
    }

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

    const res = await yts(videoId);

    const video = res.all?.[0];
    // console.log("result: ", res.all?.[0]);

    if (!video) {
      return NextResponse.json(
        { message: "Couldn't fetch video info" },
        { status: 500 }
      );
    }

    //  const existingActiveStreams = await prisma.stream.count({
    //     where: {
    //       userId: data.creatorId
    //     },
    //   });

    //   if (existingActiveStreams >= MAX_QUEUE_LEN) {
    //   return NextResponse.json(
    //     {
    //       message: "Queue is full",
    //     },
    //     {
    //       status: 411,
    //     },
    //   );
    // }

    const stream = await prisma.stream.create({
      data: {
        userId: data.creatorId,
        addedBy: user.id,
        url: data.url,
        extractedId: videoId,
        type: "Youtube",
        title: video.title ?? "Can't find video",
        smallImg:
          video.thumbnail ??
          "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
        bigImg:
          video.thumbnail ??
          "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
      },
    });

    return NextResponse.json({
      message: "Added Stream",
      id: stream.id,
    });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Invalid data",
          issues: e.issues,
        },
        { status: 400 }
      );
    }

    console.error("POST /api/streams error:", e);
    return NextResponse.json(
      {
        message: "Error in adding stream",
        error: e,
      },
      { status: 411 }
    );
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  if (!creatorId) {
    return NextResponse.json(
      {
        message: "creator id not found",
      },
      {
        status: 402,
      }
    );
  }
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
  const [stream, activeStream] = await Promise.all([
    await prisma.stream.findMany({
      where: {
        userId: creatorId,
        played: false,
      },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        upvotes: {
          where: {
            userId: user.id,
          },
        },
      },
    }),
    prisma.currentStream.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        stream: true,
      },
    }),
  ]);

  return NextResponse.json({
    stream: stream.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvotes,
      haveUpvoted: rest.upvotes.length ? true : false,
    })),
    activeStream,
  });
}
