import StreamView from '@/components/StreamView'
import React from 'react'

const Creator = ({ params: {
    creatorId
} }: {
    params: {
        creatorId: string
    }
}) => {
    return (
        <StreamView creatorId={creatorId} playVideo={false} />
    )
}

export default Creator