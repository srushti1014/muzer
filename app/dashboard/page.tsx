import StreamView from "@/components/StreamView"

const creatorId ="8d96adf1-28ea-4a88-8ef0-c47ab0518556"

export default function Dashboard() {
  return (
    <StreamView creatorId={creatorId as string} playVideo={true} />
  )
}