"use client"
import StreamView from "@/components/StreamView"
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react"


export default function Dashboard() {

  const params = useParams();
  const spaceId = params?.spaceId as string;
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [loading1, setLoading1] = useState(true);

  useEffect(() => {
    async function fetchHostId() {
      try {
        const res = await axios.get(`/api/spaces/?spaceId=${spaceId}`);
        // console.log("res of space for hostId:", res)
        // if (!res) {
        //     throw new Error(res.message || "Failed to retreive space's host id");
        //   }
        setCreatorId(res.data.hostId)

      } catch (error) {
        console.error("Failed to fetch hostId", error);
      } finally {
        setLoading1(false);
      }
    }
    fetchHostId();
  }, [spaceId])

  return (
    <StreamView creatorId={creatorId as string} playVideo={true} spaceId={spaceId} />
  )
}