"use client"
import StreamView from "@/components/StreamView"
import axios from "axios";
import { useEffect, useState } from "react"


export default function Dashboard({ params: { spaceId } }: { params: { spaceId: string } }) {

  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [loading1, setLoading1] = useState(true);

  useEffect(() => {
    async function fetchHostId() {
      try {
        const res = await axios.get(`/api/space/?spaceId=${spaceId}`);
        console.log("res of space for hostId:", res)
        // if (!res) {
        //     throw new Error(res.message || "Failed to retreive space's host id");
        //   }
        setCreatorId(res.data.hostId)

      } catch (error) {

      }
      finally {
        setLoading1(false)
      }
    }
    fetchHostId();
  }, [])

  // const creatorId ="8d96adf1-28ea-4a88-8ef0-c47ab0518556"
  return (
    <StreamView creatorId={creatorId as string} playVideo={true} spaceId={spaceId} />
  )
}