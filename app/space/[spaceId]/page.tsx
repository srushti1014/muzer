"use client"
import Loader from '@/components/Loader';
import StreamView from '@/components/StreamView'
import { useSocket } from '@/context/socket-con';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function Creator() {

  const { socket, user, loading, setUser, connectionError } = useSocket();

  const router = useRouter();
  const params = useParams();
  const spaceId = params?.spaceId as string;
  const [creatorId, setCreatorId] = useState<string>();
  const [loading1, setLoading1] = useState(true);

  useEffect(() => {
    async function fetchHostId() {
      try {
        const res = await axios.get(`/api/spaces/?spaceId=${spaceId}`);
        console.log("res of space for hostId:", res)
        setCreatorId(res.data.hostId)
        console.log("careatorId", res.data.hostId)

      } catch (error) {
        console.error("Failed to fetch hostId", error);
      }
      finally {
        setLoading1(false)
      }
    }
    fetchHostId()
  }, [spaceId])

  useEffect(() => {
    const joinRoom = async () => {
      if (user && socket && creatorId) {
        // const token = user.token || jwt.sign(
        //   {
        //     creatorId: creatorId,
        //     userId: user?.id
        //   },
        //   process.env.NEXT_PUBLIC_SECRET || "",
        //   {
        //     expiresIn: "24h",
        //   }
        // )
        const res = await axios.post("/api/token", {
          userId: user.id,
          creatorId,
        });

        const { token } = res.data;
        socket?.send(
          JSON.stringify({
            type: "join-room",
            data: {
              token,
              spaceId
            },
          })
        );
        if (!user.token) {
          setUser({ ...user, token });
        }
      }
    }
    joinRoom()
  }, [user,spaceId,creatorId,socket])

  useEffect(() => {
      if (!loading && !user) {
        toast.info("Login first!", {
          position: "top-right",
        });
        router.push("/");
      }
    }, [user, loading]);

  if (connectionError) {
    return <div>Cannot connect to socket server</div>;
  }

  if (loading || loading1) {
    return <Loader></Loader>
  }

  

  return (
    <StreamView creatorId={creatorId as string} playVideo={false} spaceId={spaceId} />
  )
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