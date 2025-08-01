"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Trash2 } from "lucide-react"

// Sample data - replace with your actual data
const sampleSpaces = [
  { id: 1, name: "Team Standup", status: "Active" },
  { id: 2, name: "Project Planning", status: "Inactive" },
  { id: 3, name: "Design Review", status: "Active" },
  { id: 4, name: "Client Meeting", status: "Active" },
]

export default function SpacesDashboard() {
  const [spaces, setSpaces] = useState(sampleSpaces)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState("")

  // Set to empty array to see empty state
  // const [spaces, setSpaces] = useState([])

  const handleCreateSpace = () => {
    if (newSpaceName.trim()) {
      const newSpace = {
        id: Date.now(),
        name: newSpaceName.trim(),
        status: "Active",
      }
      setSpaces([...spaces, newSpace])
      setNewSpaceName("")
      setIsCreateModalOpen(false)
    }
  }

  const handleDeleteSpace = (id: number) => {
    setSpaces(spaces.filter((space) => space.id !== id))
  }

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

        {/* Spaces Grid or Empty State */}
        {spaces.length === 0 ? (
          <div className="flex justify-center">
            <div className="max-w-md w-full">
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center bg-slate-800/30 backdrop-blur-sm">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No spaces yet</h3>
                <p className="text-slate-400">You have not created any spaces yet.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {spaces.map((space) => (
              <Card
                key={space.id}
                className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-200 hover:scale-105 hover:shadow-xl group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {space.name}
                    </h3>
                    <Badge
                      variant={space.status === "Active" ? "default" : "secondary"}
                      className={
                        space.status === "Active"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-slate-600 hover:bg-slate-700 text-slate-200"
                      }
                    >
                      {space.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center text-sm text-slate-400">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Team Space</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-3">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Join
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteSpace(space.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
