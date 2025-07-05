import React, { useState } from "react";
import { Home, FileText, PlusCircle, Settings, Bell } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { pinata } from "@/utils/config";
import { createPost } from "@/utils/functions/createPost";
import { useProgram } from "@/utils/setup";
import { toast } from "react-hot-toast";


interface SidebarProps {
  username: string;
  karma: number;
}

const Sidebar = ({ username, karma }: SidebarProps) => {
  const { publicKey } = useWallet();
  const { program } = useProgram();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posting, setPosting] = useState<boolean>(false);

  const shortWallet = publicKey
    ? `${publicKey.toBase58().slice(0, 6)}...${publicKey
      .toBase58()
      .slice(-4)}`
    : "";

  const navItems = [
    { label: "Home", href: "/", icon: <Home size={18} /> },
    { label: "My Posts", href: "/myposts", icon: <FileText size={18} /> },
    { label: "Notifications", href: "/notifications", icon: <Bell size={18} /> },
    { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const input = form.elements.namedItem("postContent") as HTMLInputElement;
    const content = input.value.trim();

    if (!content) {
      toast.error("Post content cannot be empty.");
      return;
    }

    try {
      setPosting(true);

      if (!publicKey) throw new Error("Wallet not connected");

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          content,
          username,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (!program) {
        throw new Error("Solana program not initialized.");
      }

      const tx = await createPost(program, publicKey, data.ipfs_hash, setPosting);
      console.log("Transaction success:", tx);

      toast.success("Post created!");
      input.value = "";
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Post creation failed:", error);
      toast.error(error.message || "Failed to create post.");
    } finally {
      setPosting(false);
    }
  };


  return (
    <>
      <aside className="w-64 bg-background text-foreground border-r border-border flex flex-col px-4 py-6">
        {/* User Info */}
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-16 h-16 mb-2">
            <AvatarFallback>{username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-lg font-medium">{username || "User"}</p>
            <p className="text-sm text-muted-foreground">{shortWallet}</p>
            <p className="text-sm mt-1">
              Karma: <span className="font-semibold">{karma}</span>
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Create Post Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="default"
          className="justify-start gap-3 w-full mb-2"
        >
          <PlusCircle size={18} />
          Create Post
        </Button>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="justify-start gap-3 w-full"
              asChild
            >
              <a href={item.href}>
                {item.icon}
                {item.label}
              </a>
            </Button>
          ))}
        </nav>

        <div className="mt-auto pt-6 text-center text-xs text-muted-foreground">
          © 2024 Dappit
        </div>
      </aside>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Post</DialogTitle>
            <DialogDescription>Share your thoughts with the world.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <input
              name="postContent"
              placeholder="What's on your mind?"
              className="w-full p-3 border border-border rounded-md bg-background text-foreground text-sm"
              autoFocus
              disabled={posting}
            />
            <Button type="submit" className="w-full" disabled={posting}>
              {posting ? "Posting..." : "Post"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;
