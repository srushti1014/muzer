import StreamView from '@/components/StreamView'
import { FC } from 'react'

type Props = {
  params: {
    creatorId: string
  }
}

const Creator: FC<Props> = ({ params }) => {
  return <StreamView creatorId={params.creatorId} playVideo={false} />
}

export default Creator
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