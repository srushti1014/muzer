"use client"
import StreamView from '@/components/StreamView'
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Creator() {
  const params = useParams();
  const spaceId = params?.spaceId as string;
  const [creatorId, setCreatorId] = useState<string>();
  const [loading1, setLoading1] = useState(true);
  console.log(loading1)
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
        console.error("Failed to fetch hostId", error);
      }
      finally {
        setLoading1(false)
      }
    }
    fetchHostId()
  }, [spaceId])
  return (
    <StreamView creatorId={creatorId as string} playVideo={false} spaceId={spaceId} />
  )
}