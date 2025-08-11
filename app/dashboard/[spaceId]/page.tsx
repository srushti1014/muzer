"use client";
import Loader from "@/components/Loader";
import StreamView from "@/components/StreamView";
import { useSocket } from "@/context/socket-con";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Dashboard() {
  const { socket, user, loading, setUser, connectionError } = useSocket();
  const params = useParams();
  const router = useRouter();
  const spaceId = params?.spaceId as string;

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.info("Login first!", { position: "top-right" });
      router.push("/");
    }
  }, [user, loading, router]);

  // Redirect if not the creator
  useEffect(() => {
    if (user && user.id && user.id !== undefined) {
      axios.get(`/api/spaces/?spaceId=${spaceId}`).then((res) => {
        if (res.data.hostId !== user.id) {
          toast.warn("You are not the creator of this space", {
            position: "top-right",
          });
          router.push("/");
        }
      });
    }
  }, [user, spaceId, router]);

  // Join room as creator
  // Join room as creator
  useEffect(() => {
    if (!socket || !user || !spaceId) return;

    const joinRoom = async () => {
      if (socket.readyState !== WebSocket.OPEN) {
        socket.addEventListener("open", joinRoom, { once: true });
        return;
      }

      try {
        const res = await axios.post("/api/token", {
          userId: user.id,
          creatorId: user.id,
        });

        const { token } = res.data;
        socket.send(
          JSON.stringify({
            type: "join-room",
            data: { token, spaceId },
          })
        );

        if (!user.token) setUser({ ...user, token });
      } catch (err) {
        console.error("Failed to join room:", err);
      }
    };

    joinRoom();
  }, [socket, user, spaceId, setUser]);

  if (connectionError) {
    return <div>Cannot connect to socket server</div>;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <StreamView
      creatorId={user?.id as string}
      playVideo={true}
      spaceId={spaceId}
    />
  );
}








// "use client"
// import Loader from "@/components/Loader";
// import StreamView from "@/components/StreamView"
// import axios from "axios";
// import { useSession } from "next-auth/react";
// import { useParams } from "next/navigation";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react"
// import { toast } from "react-toastify";


// export default function Dashboard() {

//   const { data: session, status } = useSession();
//   const params = useParams();
//   const spaceId = params?.spaceId as string;
//   const [creatorId, setCreatorId] = useState<string | null>(null);
//   const [loading1, setLoading1] = useState(true);

//   console.log(loading1)
//   const router = useRouter();

//   console.log("spaceId", spaceId)

//   useEffect(() => {
//     async function fetchHostId() {
//       try {
//         const res = await axios.get(`/api/spaces/?spaceId=${spaceId}`);
//         console.log("res of space for hostId:", res)
//         setCreatorId(res.data.hostId)
//         console.log("careatorId", res.data.hostId)

//       } catch (error) {
//         console.error("Failed to fetch hostId", error);
//       } finally {
//         setLoading1(false);
//       }
//     }
//     fetchHostId();
//   }, [spaceId])


//   if (status === "loading") return <div><Loader/></div>;

//   if (!session) {
//     toast.info("Login first!", {
//       position: "top-right",
//     })
//     router.push("/");
//     return null;
//   }

//   return (
//     <StreamView creatorId={creatorId as string} playVideo={true} spaceId={spaceId} />
//   )
// }