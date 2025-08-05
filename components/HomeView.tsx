"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import SpaceCard from "./SpaceCard"

interface Space {
  endTime?: Date | null;
  hostId: string;
  id: string;
  isActive: boolean;
  name: string;
  startTime: Date | null;
}

export default function SpacesDashboard() {
  const [spaces, setSpaces] = useState<Space[] | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState("")
  
  const fetchSpaces = async () => {
    const res = await axios.get(`/api/spaces`)
    console.log("space data fetched : ", res)
    const data: Space[] = res.data.spaces
    setSpaces(data)
  }
  useEffect(() => {
    fetchSpaces();
  }, [])


  const handleCreateSpace = async () => {
    const res = await axios.post(`/api/spaces`, {
      spaceName: newSpaceName,
    })
    const data = res.data;
    setNewSpaceName("")
    setIsCreateModalOpen(false)
    toast.success(data.message)
    fetchSpaces();
  }

  const handleDeleteSpace = async (spaceId: string) => {
    const res = await axios.delete(`/api/spaces?spaceId=${spaceId}`);
    const data = res.data;

    setSpaces((prev) => {
      const updatedSpaces: Space[] = prev
        ? prev.filter((space) => space.id !== spaceId)
        : [];
      return updatedSpaces;
    });

    toast.success(data.message || "Space deleted");

  };


  // if (spaces && spaces.length > 0) {
  //   return (
  //     <>
  //       {spaces.map((space) => (
  //         <SpaceCard
  //           key={space.id}
  //           space={space}
  //           handleDeleteSpace={handleDeleteSpace}
  //         />
  //       ))}
  //     </>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
            Spaces
          </h1>
          <p className="text-lg text-slate-300">Manage your collaborative spaces and join team discussions</p>
        </div>

        {/* Create Button */}
        <div className="mb-8 flex justify-center">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create a new Space
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create new space</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="spaceName" className="text-slate-200">
                    Space Name
                  </Label>
                  <Input
                    id="spaceName"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    placeholder="Enter space name..."
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setNewSpaceName("")
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSpace}
                  disabled={!newSpaceName.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Create Space
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Space Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {spaces === null ? (
            <p className="text-white">Loading...</p>
          ) : spaces.length === 0 ? (
            <p className="text-white">No spaces found.</p>
          ) : (
            spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                handleDeleteSpace={handleDeleteSpace}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
