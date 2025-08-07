"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import audience from "@/public/audience.jpg";
import { Button } from "./ui/button";
import { ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DialogDescription } from "@radix-ui/react-dialog";
import Link from "next/link";

interface SpaceCardProps {
  space: {
    id: string;
    name: string;
  };
  handleDeleteSpace: (id: string) => void;
}

const SpaceCard = ({ space, handleDeleteSpace }: SpaceCardProps) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSpaceToDelete(id);
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    if (spaceToDelete) {
      handleDeleteSpace(spaceToDelete);
      setSpaceToDelete(null);
      setIsDialogOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6"
    >
      <Card className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 transition-all duration-300 ease-in-out hover:shadow-[0_10px_20px_rgba(128,90,213,0.5)]">
        <CardContent className="p-0">
          <motion.div
            className="relative h-48 w-full sm:h-64 md:h-72 lg:h-80 xl:h-96"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src={audience}
              alt="Space image"
              layout="fill"
              objectFit="cover"
              className="rounded-t-2xl"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />

            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                {space.name}
              </h2>
            </motion.div>
          </motion.div>
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row gap-2 justify-center items-center p-4 sm:p-6 ">
          <Link href={`/dashboard/${space.id}`}
            className="flex items-center justify-between rounded-lg border-purple-600 bg-purple-700 text-white shadow-md transition-colors duration-300 hover:bg-purple-600 hover:shadow-purple-600/50 md:w-auto p-2"
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            View Space
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="rounded-lg border-gray-500 bg-gray-600 text-gray-200 shadow-md transition-colors duration-300 hover:bg-gray-700 hover:text-white hover:shadow-gray-500/50 md:w-auto"
                onClick={() => handleDeleteClick(space.id)}
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Space
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this space? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-wrap flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg bg-red-600 text-white shadow-md transition-colors duration-300 hover:bg-red-700 hover:shadow-red-500/50 sm:w-auto"
                  onClick={confirmDelete}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SpaceCard;
