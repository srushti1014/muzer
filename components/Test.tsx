"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import Appbar from "./Appbar";
import { toast } from "react-toastify";
import axios from "axios";

interface Space {
  hostId: string;
  id: string;
  isActive: boolean;
  name: string;
}

export default function HomeView() {
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaces, setSpaces] = useState<Space[] | null>(null);
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Spaces data:", spaces);
  }, [spaces]);

  useEffect(() => {
    const fetchSpaces = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/spaces`, {
          withCredentials: true,
        });

        if (!response.data) {
          throw new Error(response.data.message || "Failed to fetch spaces");
        }

        const fetchedSpaces: Space[] = response.data.spaces;
        setSpaces(fetchedSpaces);
      } catch (error) {
        toast.error("Error fetching spaces");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpaces();
  }, []);

  const handleCreateSpace = async () => {
    setIsCreateSpaceOpen(false);
    try {
      const response = await axios.post(`/api/spaces`, {
        spaceName: spaceName,
      });

      if (!response.data) {
        throw new Error(response.data.message || "Failed to create space");
      }

      const newSpace = response.data.space;
      setSpaces((prev) => {
        const updatedSpaces: Space[] = prev ? [...prev, newSpace] : [newSpace];
        return updatedSpaces;
      });
      toast.success(response.data.message);
      setSpaceName(""); // Reset the input field
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Error Creating Space");
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    try {
      const response = await axios.delete(`/api/spaces/?spaceId=${spaceId}`);
      
      if (!response.data) {
        throw new Error(response.data.message || "Failed to delete space");
      }

      setSpaces((prev) => 
        prev ? prev.filter((space) => space.id !== spaceId) : []
      );
      toast.success("Space deleted successfully");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Error Creating Space");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-black text-gray-200">
        <Appbar />
        <div className="flex flex-grow items-center justify-center">
          <p>Loading spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-black text-gray-200">
      <Appbar />
      
      <div className="flex flex-grow flex-col items-center px-4 py-8">
        <div className="h-36 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-900 bg-clip-text text-9xl font-bold text-transparent">
          Spaces
        </div>
        
        <Button
          onClick={() => setIsCreateSpaceOpen(true)}
          className="mt-10 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
        >
          Create a new Space
        </Button>

        {/* Spaces List Section */}
        <div className="mt-12 w-full max-w-4xl">
          <h2 className="mb-6 text-2xl font-semibold text-gray-300">
            Your Spaces
          </h2>
          
          {spaces && spaces.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {spaces.map((space) => (
                <div 
                  key={space.id}
                  className="rounded-lg border border-gray-700 bg-gray-800 p-6 transition-all hover:border-purple-500"
                >
                  <h3 className="text-xl font-medium text-white">{space.name}</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {space.isActive ? "Active" : "Inactive"}
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Join
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteSpace(space.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-700 p-8 text-center">
              <p className="text-gray-400">You have not created any spaces yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Space Dialog */}
      <Dialog open={isCreateSpaceOpen} onOpenChange={setIsCreateSpaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-10 text-center">
              Create new space
            </DialogTitle>
            
            <fieldset className="Fieldset">
              <label
                className="text-violet11 w-[90px] text-right text-xl font-bold"
                htmlFor="name"
              >
                Space Name
              </label>
              
              <input
                className="text-violet11 shadow-violet7 focus:shadow-violet8 mt-5 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                id="name"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="Enter space name"
              />
            </fieldset>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateSpaceOpen(false)}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleCreateSpace}
              className="bg-purple-600 text-white hover:bg-purple-700"
              disabled={!spaceName.trim()}
            >
              Create Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}