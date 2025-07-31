import StreamView from '@/components/StreamView'
import React from 'react'

const Creator = ({
  params,
}: {
  params: { creatorId: string };
}) => {
  return <StreamView creatorId={params.creatorId} playVideo={false} />;
};

export default Creator