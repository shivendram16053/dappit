"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import Navbar from "@/components/ui/bar/Navbar";
import { useProgram } from "@/utils/setup";
import { PublicKey } from "@solana/web3.js";
import { fetchAllPosts } from "@/utils/functions/fetchAllPosts";
import IPFSContent from "@/components/ui/ipfscontent";
import { PlusCircle } from "lucide-react";
import { VoteControls } from "@/components/ui/votecontrols";
import { createPost } from "@/utils/functions/createPost";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type PostAccount = {
  publicKey: PublicKey;
  account: {
    creator: PublicKey;
    ipfs_hash: string;
    upvote: number;
    downvote: number;
    createdAt: number;
  };
};

const Dashboard = () => {
  const { publicKey, connected } = useWallet();
  const { program } = useProgram();

  const [username, setUsername] = useState<string>("");
  const [karma, setKarma] = useState<number>(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [posts, setPosts] = useState<false | PostAccount[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posting, setPosting] = useState(false);


  const didFetch = useRef(false);

  const fetchUserProfile = async () => {
    if (!program || !publicKey) return;
    setLoadingProfile(true);
    try {
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), publicKey.toBuffer()],
        program.programId
      );

      //@ts-ignore
      const userProfile = await program.account.userProfile.fetch(userPda);
      setUsername(userProfile.username);
      setKarma(userProfile.karma.toNumber());
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          content,
          username,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (!program) throw new Error("Solana program not initialized");

      const tx = await createPost(program, publicKey, data.ipfs_hash, setPosting);
      console.log("Transaction success:", tx);

      toast.success("Post created!");
      input.value = "";
      setIsModalOpen(false);
      fetchPosts(); // refresh posts after creating
    } catch (err: any) {
      console.error("Post creation failed:", err);
      toast.error(err.message || "Failed to create post.");
    } finally {
      setPosting(false);
    }
  };


  const fetchPosts = async () => {
    if (!program || !publicKey) return;
    setLoadingPosts(true);
    try {
      const fetchedPosts = await fetchAllPosts(program);
      if (fetchedPosts) setPosts(fetchedPosts);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      toast.error("Error loading posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey && program && !didFetch.current) {
      didFetch.current = true;
      fetchUserProfile();
      fetchPosts();
    }
  }, [connected, publicKey, program]);

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <p className="mt-4 text-lg">Please connect your wallet to access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar username={!loadingProfile ? username : undefined} />
      <div className="flex justify-center flex-1">
        <main className="flex-grow  dark:bg-gray-900 py-8">
          <div className="w-full max-w-[900px] px-4 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">
                {loadingProfile ? "Loading your profile..." : `Welcome, ${username || "User"}!`}
              </h1>

              <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-white hover:cursor-pointer">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Post
              </Button>
            </div>


            <section className="p-6 dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4">All Posts</h2>

              {loadingPosts ? (
                <p className="text-gray-400">Loading posts...</p>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => {
                    const creator = post.account.creator.toBase58();
                    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${creator}`;

                    return (
                      <div
                        key={post.publicKey.toBase58()}
                        className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-4 flex gap-4 items-start border dark:border-gray-700"
                      >
                        <img
                          src={avatarUrl}
                          alt="user"
                          className="w-10 h-10 rounded-full border shadow-sm"
                        />

                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <a
                              href={`https://explorer.solana.com/address/${creator}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                            >
                              {creator.slice(0, 4)}...{creator.slice(-4)}
                            </a>
                            <span className="text-xs text-gray-400">
                              {new Date(post.account.createdAt * 1000).toLocaleString(undefined, {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>

                          <IPFSContent hash={post.account.ipfs_hash} />

                          <div className="flex items-center mt-3 gap-4 text-gray-600 dark:text-gray-300 text-sm">
                            <VoteControls
                              post={post}
                              program={program}
                              publicKey={publicKey}
                              onVoted={(updatedPost) => {
                                setPosts((prev) =>
                                  prev
                                    ? prev.map((p) =>
                                      p.publicKey.toBase58() === updatedPost.publicKey.toBase58()
                                        ? updatedPost
                                        : p
                                    )
                                    : []
                                );
                              }}
                            />

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No posts yet. Start by creating your first post!</p>
              )}
            </section>
          </div>
        </main>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
              <DialogDescription>Share your thoughts with the world.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreatePost} className="space-y-4 mt-4">
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


      </div>
    </div>
  );
};

export default Dashboard;
