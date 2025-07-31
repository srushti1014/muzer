import StreamView from '@/components/StreamView'
type Props = {
  params: {
    creatorId: string
  }
}

export default function Creator({ params }: Props) {
  return <StreamView creatorId={params.creatorId} playVideo={false} />
}

// import StreamView from '@/components/StreamView'
// import React from 'react'

// const Creator = ({ params: {
//     creatorId
// } }: {
//     params: {
//         creatorId: string
//     }
// }) => {
//     return (
//         <StreamView creatorId={creatorId} playVideo={false} />
//     )
// }

// export default Creator