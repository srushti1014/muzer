import StreamView from '@/components/StreamView'
import { FC } from 'react'

interface PageProps {
  params: {
    creatorId: string
  }
}
//here cahnghe 
const CreatorPage: FC<PageProps> = ({ params }) => {
  return <StreamView creatorId={params.creatorId} playVideo={false} />
}

export default CreatorPage
