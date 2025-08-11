"use client";
import Loader from '@/components/Loader';
import StreamView from '@/components/StreamView';
import { useSocket } from '@/context/socket-con';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function Creator() {
  const { socket, user, loading, setUser, connectionError } = useSocket();

  const router = useRouter();
  const params = useParams();
  const spaceId = params?.spaceId as string;
  const [creatorId, setCreatorId] = useState<string>();
  const [loading1, setLoading1] = useState(true);

  // Fetch creatorId for this space
  useEffect(() => {
    async function fetchHostId() {
      try {
        const res = await axios.get(`/api/spaces/?spaceId=${spaceId}`);
        setCreatorId(res.data.hostId);
      } catch (error) {
        console.error("Failed to fetch hostId", error);
      } finally {
        setLoading1(false);
      }
    }
    fetchHostId();
  }, [spaceId]);

  // Ensure user is logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.info("Login first!", { position: "top-right" });
      router.push("/");
    }
  }, [user, loading, router]);

  // Join the WebSocket room once everything is ready
  useEffect(() => {
    if (!socket || !user || !creatorId || !spaceId) return;

    const joinRoom = async () => {
      try {
        const res = await axios.post("/api/token", {
          userId: user.id,
          creatorId,
        });

        const { token } = res.data;
        socket.send(JSON.stringify({
          type: "join-room",
          data: { token, spaceId }
        }));

        if (!user.token) setUser({ ...user, token });
      } catch (err) {
        console.error("Failed to join room:", err);
      }
    };

    joinRoom();
  }, [socket, user, creatorId, spaceId, setUser]);

  if (connectionError) {
    return <div>Cannot connect to socket server</div>;
  }

  if (loading || loading1) {
    return <Loader />;
  }

  return (
    <StreamView creatorId={creatorId as string} playVideo={false} spaceId={spaceId} />
  );
}



// "use client"
// import Loader from '@/components/Loader';
// import StreamView from '@/components/StreamView'
// import axios from 'axios';
// import { useSession } from 'next-auth/react';
// import { useParams } from 'next/navigation';
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';

// export default function Creator() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const params = useParams();
//   const spaceId = params?.spaceId as string;
//   const [creatorId, setCreatorId] = useState<string>();
//   const [loading1, setLoading1] = useState(true);
//   console.log("spaceId", spaceId)
//   console.log(loading1)
//   useEffect(() => {
//     async function fetchHostId() {
//       try {
//         const res = await axios.get(`/api/spaces/?spaceId=${spaceId}`);
//         console.log("res of space for hostId:", res)
//         setCreatorId(res.data.hostId)
//         console.log("careatorId", res.data.hostId)

//       } catch (error) {
//         console.error("Failed to fetch hostId", error);
//       }
//       finally {
//         setLoading1(false)
//       }
//     }
//     fetchHostId()
//   }, [spaceId])

//   if (status === "loading") return <div><Loader /></div>;

//   if (!session) {
//     toast.info("Login first!", {
//       position: "top-right",
//     })
//     router.push("/");
//     return null;
//   }
//   return (
//     <StreamView creatorId={creatorId as string} playVideo={false} spaceId={spaceId} />
//   )
// }