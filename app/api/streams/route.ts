import prisma from "@/lib/db";
import { YT_REGEX } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { auth } from "@/lib/auth";
import axios from "axios";

// Stream	A single song.
// Space	A queue.
// CurrentStream	Tracks the one Stream that is currently playing in a Space.

const CreateStreamSchema = z.object({
  creatorId: z.string(), //The host of the space (who owns the queue)
  url: z.string(),
  spaceId: z.string(), // A single creator can have multiple spaces
});

const MAX_QUEUE_LEN = 20;

export async function POST(req: NextRequest) {
  try {
    const data1 = await req.json()
    console.log("dataaaaaa:", data1)
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthenticated",
        },
        {
          status: 403,
        }
      );
    }

    const user = session.user; //The currently logged-in user from session (fan or creator)

    const data = CreateStreamSchema.parse(data1);
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    const videoId = data.url.match(YT_REGEX)?.[1];
    console.log("voideoId-----------------", videoId)

    if (!videoId) {
      return NextResponse.json(
        { message: "Invalid YouTube URL format" },
        { status: 400 }
      );
    }

    const ytRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet`
    );
    // console.log("fetched videos res :", ytRes.data.items?.[0]?.snippet)

    const snippet = ytRes.data.items?.[0]?.snippet;

    if (!snippet) {
      return NextResponse.json(
        { message: "Couldn't fetch video info from YouTube" },
        { status: 500 }
      );
    }

    //check of user is not creator
    if (user.id !== data.creatorId) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

      const userRecentStreams = await prisma.stream.count({
        where: {
          userId: data.creatorId,
          addedBy: user.id,
          createAt: {
            gte: tenMinutesAgo,
          },
        },
      });

      //duplicate song
      const duplicateSong = await prisma.stream.findFirst({
        where: {
          userId: data.creatorId,
          extractedId: videoId,
          createAt: {
            gte: tenMinutesAgo,
          },
        },
      });
      if (duplicateSong) {
        return NextResponse.json(
          {
            message: "This song was already added in the last 10 minutes",
          },
          {
            status: 429,
          }
        );
      }
      // Rate limiting checks for non-creator users
      const streamsLastTwoMinutes = await prisma.stream.count({
        where: {
          userId: data.creatorId,
          addedBy: user.id,
          createAt: {
            gte: twoMinutesAgo,
          },
        },
      });

      if (streamsLastTwoMinutes >= 2) {
        return NextResponse.json(
          {
            message:
              "Rate limit exceeded: You can only add 2 songs per 2 minutes",
          },
          {
            status: 429,
          }
        );
      }

      if (userRecentStreams >= 5) {
        return NextResponse.json(
          {
            message:
              "Rate limit exceeded: You can only add 5 songs per 10 minutes",
          },
          {
            status: 429,
          }
        );
      }
    }

    const existingActiveStreams = await prisma.stream.count({
      where: {
        spaceId: data.spaceId,
        played: false,
      },
    });

    if (existingActiveStreams >= MAX_QUEUE_LEN) {
      return NextResponse.json(
        {
          message: "Queue is full",
        },
        {
          status: 429,
        }
      );
    }

    const stream = await prisma.stream.create({
      data: {
        userId: data.creatorId,
        addedBy: user.id, //The currently logged-in user from session (fan or creator)
        url: data.url,
        extractedId: videoId,
        type: "Youtube",
        title: snippet.title ?? "Can't find video",
        smallImg:
          snippet.thumbnails?.default?.url ??
          "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
        bigImg:
          snippet.thumbnails?.high?.url ??
          "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
        spaceId: data.spaceId,
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

// export async function POST(req: NextRequest) {
//   try {
//     // console.log("dataaaaaa:", await req.json())
//     const session = await auth();;
//     if (!session?.user?.id) {
//       return NextResponse.json(
//         {
//           message: "Unauthenticated",
//         },
//         {
//           status: 403,
//         }
//       );
//     }

//     const user = session.user; //The currently logged-in user from session (fan or creator)

//     const data = CreateStreamSchema.parse(await req.json());
//     const isYt = data.url.match(YT_REGEX);
//     const videoId = data.url.match(YT_REGEX)?.[1];
//     console.log("videoId :",videoId);
//     if (!isYt || !videoId) {
//       return NextResponse.json(
//         {
//           message: "Invalid YouTube URL format",
//         },
//         {
//           status: 400,
//         }
//       );
//     }
//     const res = await yts(videoId);
//     const video = res.all?.[0];
//     console.log("result: ", res.all?.[0]);
//     if (!video) {
//       return NextResponse.json(
//         { message: "Couldn't fetch video info" },
//         { status: 500 }
//       );
//     }

//     //check of user is not creator
//     if (user.id !== data.creatorId) {
//       const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
//       const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

//       const userRecentStreams = await prisma.stream.count({
//         where: {
//           userId: data.creatorId,
//           addedBy: user.id,
//           createAt: {
//             gte: tenMinutesAgo,
//           },
//         },
//       });

//       //duplicate song
//       const duplicateSong = await prisma.stream.findFirst({
//         where: {
//           userId: data.creatorId,
//           extractedId: videoId,
//           createAt: {
//             gte: tenMinutesAgo,
//           },
//         },
//       });
//       if (duplicateSong) {
//         return NextResponse.json(
//           {
//             message: "This song was already added in the last 10 minutes",
//           },
//           {
//             status: 429,
//           }
//         );
//       }
//       // Rate limiting checks for non-creator users
//       const streamsLastTwoMinutes = await prisma.stream.count({
//         where: {
//           userId: data.creatorId,
//           addedBy: user.id,
//           createAt: {
//             gte: twoMinutesAgo,
//           },
//         },
//       });

//       if (streamsLastTwoMinutes >= 2) {
//         return NextResponse.json(
//           {
//             message:
//               "Rate limit exceeded: You can only add 2 songs per 2 minutes",
//           },
//           {
//             status: 429,
//           }
//         );
//       }

//       if (userRecentStreams >= 5) {
//         return NextResponse.json(
//           {
//             message:
//               "Rate limit exceeded: You can only add 5 songs per 10 minutes",
//           },
//           {
//             status: 429,
//           }
//         );
//       }
//     }

//     const existingActiveStreams = await prisma.stream.count({
//       where: {
//         spaceId: data.spaceId,
//         played: false,
//       },
//     });

//     if (existingActiveStreams >= MAX_QUEUE_LEN) {
//       return NextResponse.json(
//         {
//           message: "Queue is full",
//         },
//         {
//           status: 429,
//         }
//       );
//     }

//     const stream = await prisma.stream.create({
//       data: {
//         userId: data.creatorId,
//         addedBy: user.id, //The currently logged-in user from session (fan or creator)
//         url: data.url,
//         extractedId: videoId,
//         type: "Youtube",
//         title: video.title ?? "Can't find video",
//         smallImg:
//           video.thumbnail ??
//           "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
//         bigImg:
//           video.thumbnail ??
//           "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
//         spaceId: data.spaceId,
//       },
//     });

//     return NextResponse.json({
//       message: "Added Stream",
//       id: stream.id,
//     });
//   } catch (e) {
//     if (e instanceof ZodError) {
//       return NextResponse.json(
//         {
//           message: "Invalid data",
//           issues: e.issues,
//         },
//         { status: 400 }
//       );
//     }

//     console.error("POST /api/streams error:", e);
//     return NextResponse.json(
//       {
//         message: "Error in adding stream",
//         error: e,
//       },
//       { status: 411 }
//     );
//   }
// }

export async function GET(req: NextRequest) {
  const spaceId = req.nextUrl.searchParams.get("spaceId");
  const session = await auth();
  if (!session?.user.id) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      }
    );
  }

  if (!spaceId) {
    return NextResponse.json(
      {
        message: "Error",
      },
      {
        status: 411,
      }
    );
  }
  const [space, activeStream] = await Promise.all([
    await prisma.space.findUnique({
      where: {
        id: spaceId,
      },
      include: {
        streams: {
          include: {
            _count: {
              select: {
                upvotes: true,
              },
            },
            upvotes: {
              where: {
                userId: session?.user.id,
              },
            },
          },
          where: {
            played: false,
          },
        },
        _count: {
          select: {
            streams: true,
          },
        },
      },
    }),
    prisma.currentStream.findFirst({
      where: {
        spaceId: spaceId,
      },
      include: {
        stream: true,
      },
    }),
  ]);

  const hostId = space?.hostId;
  const isCreator = session.user.id === hostId;

  return NextResponse.json({
    stream: space?.streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvotes,
      haveUpvoted: rest.upvotes.length ? true : false,
    })),
    activeStream,
    hostId,
    isCreator,
    spaceName: space?.name,
  });
}
