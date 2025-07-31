import StreamView from "@/components/StreamView"

const creatorId ="c13da1ee-ef2c-4603-9a17-563f0555f281"

export default function Dashboard() {
  return (
    <StreamView creatorId={creatorId} playVideo={true} />
  )
}