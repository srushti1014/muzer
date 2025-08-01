// import StreamView from '@/components/StreamView'
// import React from 'react'

// const Creator = ({ params: { creatorId } }: { params: { creatorId: string } }) => {
//     return (
//         <StreamView creatorId={creatorId} playVideo={false} />
//     )
// }

// export default Creator

import StreamView from '@/components/StreamView'
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Creator({ params: { spaceId } }: { params: { spaceId: string } }) {
  const [creatorId, setCreatorId] = useState<string>();
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
    fetchHostId()
  }, [])
  return (
    <StreamView creatorId={creatorId as string} playVideo={false} spaceId={spaceId} />
  )
}