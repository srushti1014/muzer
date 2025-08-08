"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Play, Plus, Share2, Check, X, Trash2 } from "lucide-react"
import axios from "axios"
import Image from "next/image"
// @ts-expect-error: YouTubePlayer might not have types
import YouTubePlayer from 'youtube-player';
import { toast } from "react-toastify"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Stream {
  id: string
  type: string
  url: string
  extractedId: string
  title: string
  smallImg: string
  bigImg: string
  active: boolean
  upvotes: number
  userId: string
  haveUpvoted: boolean
}

export default function StreamView({
  creatorId,
  playVideo = false,
  spaceId,
}: {
  creatorId: string;
  playVideo: boolean;
  spaceId: string
}) {
  const [currentVideo, setCurrentVideo] = useState<Stream | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [playNextLoader, setplayNextLoader] = useState(false)
  const [previewVideo, setPreviewVideo] = useState<{ videoId: string; title: string; thumbnail: string } | null>(null)
  const [queue, setQueue] = useState<Stream[]>([])
  const [spaceName, setSpaceName] = useState("");
  const videoPlayerRef = useRef<HTMLDivElement | null>(null)
  const [isCreator, setIsCreator] = useState(false)
  const [isEmptyQueueDialogOpen, setIsEmptyQueueDialogOpen] = useState(false);

  async function refreshStream() {
    try {
      const res = await axios.get(`/api/streams/?spaceId=${spaceId}`, {
        withCredentials: true
      });
      setQueue(res.data.stream || [])
      setCurrentVideo(video => {
        if (video?.id === res.data?.activeStream?.stream?.id) {
          return video;
        }
        return res.data.activeStream.stream
      })
      setSpaceName(res.data.spaceName)
      setIsCreator(res.data.isCreator)
    } catch (error) {
      console.error("Error fetching streams:", error)
    }
  }

  //   useEffect(() => {
  //   if (queue.length === 1 && !currentVideo) {
  //     playNext(); // auto-play first song
  //   }
  // }, [queue]);

  // useEffect(() => {
  //   const socket = new WebSocket('ws://localhost:3000')

  //   socket.onmessage = (event) => {
  //     const msg = JSON.parse(event.data)
  //     if (msg.type === 'NEW_STREAM') {
  //       console.log('New stream added:', msg.data)
  //     }
  //   }

  //   return () => {
  //     socket.close()
  //   }
  // }, [])

  useEffect(() => {
    console.log("current video: ", currentVideo)
    console.log("playVideo: ", playVideo)
  }, [currentVideo, playVideo]);


  useEffect(() => {
    refreshStream();
    setInterval(() => {
      refreshStream()
    }, 10000)
  }, [])

  useEffect(() => {
    if (!videoPlayerRef.current || !currentVideo) {
      return;
    }
    const player = YouTubePlayer(videoPlayerRef.current as HTMLElement);

    // 'loadVideoById' is queued until the player is ready to receive API calls.
    player.loadVideoById(currentVideo.extractedId);

    // 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called.
    player.playVideo();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function eventHandler(event: any) {
      if (event.data === 0) {
        playNext();
      }
    }
    player.on("stateChange", eventHandler);
    return () => {
      player.destroy();
    };
  }, [currentVideo, videoPlayerRef]);


  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    if (!youtubeUrl) {
      setSubmitError("Please enter a YouTube URL")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await axios.post('/api/streams', {
        creatorId: creatorId,
        spaceId: spaceId,
        url: youtubeUrl,
      })
      // setCurrentVideo(res.data.stream)
      // playNext()
      // if (!currentVideo) {
      //   playNext()
      // }
      setYoutubeUrl("");
      refreshStream();
    } catch (error) {
      console.error("Error adding to queue:", error)
      setSubmitError("Failed to add video to queue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const vote = async (streamId: string, isUpvote: boolean) => {
    try {
      setQueue(queue.map(video =>
        video.id === streamId ? {
          ...video,
          upvotes: isUpvote ? video.upvotes + 1 : video.upvotes - 1,
          haveUpvoted: !video.haveUpvoted
        } : video
      ).sort((a, b) => (b.upvotes) - (a.upvotes)))

      await axios.post(`/api/streams/${isUpvote ? "upvotes" : "downvotes"}`, { streamId });
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const playNext = async () => {
    setplayNextLoader(true)
    const data = await axios.get(`/api/streams/next?spaceId=${spaceId}`, {
      withCredentials: true
    })
    setCurrentVideo(data.data.stream)
    setQueue(q => q.filter(item => item.id !== data.data?.stream?.id))
    setplayNextLoader(false)
  }

  const handleShare = async () => {
    const url = `${window.location.hostname}/space/${spaceId}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied successfully!", {
        position: "top-right",
        style: {
          background: "#d1fae5",
          color: "#065f46",
        },
      })
    })
    setCopied(true)
    setShareUrl(url)
  }

  const sortedQueue = [...queue].sort((a, b) => b.upvotes - a.upvotes)

  const removeSong = async (streamId: string) => {
    try {
      const res = await axios.delete(`/api/streams/remove?streamId=${streamId}&spaceId=${spaceId}`);
      if (res) {
        toast.success("Song removed successfully");
        refreshStream();
      } else {
        toast.error("Failed to remove song");
      }
    } catch (error) {
      toast.error("An error occurred while removing the song");
    }
  }

  const emptyQueue = async () => {
    try {
      const res = await axios.post("/api/streams/empty-queue",
        { spaceId: spaceId }
      );
      if (res) {
        toast.success(res.data.message);
        refreshStream();
        setIsEmptyQueueDialogOpen(false);
        setCurrentVideo(null)
      }
    } catch (error) {
      console.error("Error emptying queue:", error);
      toast.error("An error occurred while emptying the queue");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">🎵 {spaceName}</h1>
          <p className="text-gray-300">Vote for the next song or submit your own!</p>

          {/* Share Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleShare}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share with Fans
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Current Playing Video */}
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl backdrop-blur-sm shadow-lg overflow-hidden transition-all hover:shadow-purple-500/20 hover:border-purple-400/50 gap-0 ">
          <CardHeader className="px-3 md:px-10 py-2">
            <CardTitle className="text-white flex items-center gap-3 text-lg sm:text-xl font-semibold">
              <div className="p-1.5 bg-red-500/10 rounded-full">
                <Play className="w-5 h-5 text-red-500" />
              </div>
              <span className="bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
                Now Playing
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="">
            {currentVideo ? (
              <div className="md:p-5 p-0 group relative shadow-xl">
                {playVideo ? (
                  <div ref={videoPlayerRef} className="w-full aspect-video"></div>
                  // <iframe width={"100%"} height={500} src={`https://www.youtube.com/embed/${currentVideo.extractedId}`} allow="autoplay"></iframe>
                  // <div className="rounded-lg overflow-hidden ">
                  //   <YouTubeEmbed
                  //     videoid={currentVideo.extractedId}
                  //     params="autoplay=1&controls=1"
                  //   />
                  // </div>
                ) : (
                  <Image
                    src={currentVideo.bigImg}
                    alt="Video thumbnail"
                    width={1200}
                    height={700}
                    className="aspect-video rounded-lg object-cover transition-transform"
                  />
                )}
                {currentVideo.title && (
                  <h3 className="mt-3 text-white font-medium line-clamp-2">
                    {currentVideo.title}
                  </h3>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gray-800/50 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">No video selected</p>
              </div>
            )}
          </CardContent>
        </Card>
        {playVideo && <Button
          disabled={playNextLoader}
          onClick={() => playNext()}
          className="bg-blue-800 hover:bg-blue-900 md:w-44 md:h-10 md:text-lg px-2.5 py-1.5 sm:w-40 sm:h-20 sm:text-sm"
        >
          <Play className="w-3 h-3" />
          {playNextLoader ? "Loading..." : "play next"}
        </Button>}

        {/* Submit New Song */}
        <Card className="bg-gray-800/50 border-purple-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              Submit a Song
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                  placeholder="Paste YouTube URL here..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="bg-gray-800/50 border-purple-400/30 text-white placeholder:text-gray-400"
                />
                {submitError && (
                  <p className="text-red-400 text-sm">{submitError}</p>
                )}
                <Button
                  type="submit"
                  className="bg-green-700 hover:bg-green-700 md:w-40 md:h-9 md:text-[15px] px-2 py-1.5 sm:w-40 sm:h-20 sm:text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add to Queue"}
                </Button>
              </form>
              {previewVideo && (
                <div className="bg-gray-700/30 rounded-lg p-3 space-y-3">
                  <div className="flex gap-3">
                    <Image
                      src={previewVideo.thumbnail}
                      alt="Video thumbnail"
                      className="w-20 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{previewVideo.title}</p>
                      <p className="text-gray-400 text-xs">Ready to add to queue</p>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Add to Queue
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Queue */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-gray-800/50 border-purple-400/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>🎵 Song Queue</span>
                <div className="flex justify-center gap-2">
                  <Badge variant="secondary" className="bg-purple-600">
                    {sortedQueue.length} songs
                  </Badge>
                  {isCreator && (sortedQueue !== null) && (
                    <button
                      onClick={() => setIsEmptyQueueDialogOpen(true)}
                      className="bg-gray-700 hover:bg-red-400 hover:text-black text-white transition-colors flex items-center justify-center text-sm p-1.5 rounded-sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Empty Queue
                    </button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedQueue.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-gray-700/30 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="text-purple-300 font-bold text-sm w-6">#{index + 1}</div>

                    <Image
                      src={item.bigImg || "/placeholder.svg"}
                      alt="Video thumbnail"
                      width={64}
                      height={40}
                      className="w-16 h-10 rounded object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                      </div>
                    </div>

                    <div className="flex items-center justify center">
                      <Button
                        variant="ghost"
                        onClick={() => vote(item.id, item.haveUpvoted ? false : true)}
                        // className="h-5 w-5 p-0 text-green-400 hover:text-green-300 hover:bg-green-400/20"
                        className={`h-5 w-5 p-0 text-green-400 hover:text-green-300 hover:bg-green-400/20 ${item.haveUpvoted
                          ? "bg-green-400/20"
                          : ""
                          }`}

                      >
                        {item.haveUpvoted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>

                      <span className="text-white font-bold text-sm w-5 text-center">{item.upvotes}</span>
                      {isCreator && (
                        <button
                          onClick={() => removeSong(item.id)}
                          className="bg-gray-700 hover:bg-gray-600 text-white transition-colors ml-3 flex justify-center items-center rounded-2xl w-7 h-7"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {sortedQueue.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No songs in queue</p>
                    <p className="text-sm">Submit the first song above!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-purple-400/30 text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">{sortedQueue.length}</div>
              <div className="text-gray-400 text-sm">Songs in Queue</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-purple-400/30 text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">
                {sortedQueue.reduce((sum, item) => sum + item.upvotes, 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Votes</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-purple-400/30 text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">
                {sortedQueue.length > 0 ? sortedQueue[0].upvotes : 0}
              </div>
              <div className="text-gray-400 text-sm">Top Song Votes</div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog
        open={isEmptyQueueDialogOpen}
        onOpenChange={setIsEmptyQueueDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Empty Queue</DialogTitle>
            <DialogDescription>
              Are you sure you want to empty the queue? This will remove all
              songs from the queue. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmptyQueueDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={emptyQueue}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Empty Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}