"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "@/utils/setup";
import { fetchUserProfile } from "@/utils/functions/fetchUserProfile";
import Navbar from "@/components/ui/bar/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import { fetchPostsByUser } from "@/utils/functions/fetchUserPost";
import IPFSContent from "@/components/ui/ipfscontent";
import { VoteControls } from "@/components/ui/votecontrols";

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

const Profile = () => {
  const { publicKey, connected } = useWallet();
  const { program } = useProgram();

  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<PostAccount[] | null>(null);

  const didFetchRef = useRef(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!connected || !publicKey || !program || didFetchRef.current) return;

      didFetchRef.current = true;
      setLoading(true);

      try {
        const data = await fetchUserProfile(program, publicKey);
        if (data) {
          setProfile(data);
          const posts = await fetchPostsByUser(program, publicKey);
          setUserPosts(posts || []);
        }
      } catch (err) {
        console.error("Failed to load profile or posts:", err);
        toast.error("Failed to load profile.");
      }

      setLoading(false);
    };

    loadProfile();
  }, [connected, publicKey, program]);

  const handlePostUpdate = async (updatedPost: PostAccount) => {
    setUserPosts((prev) =>
      prev
        ? prev.map((p) =>
            p.publicKey.toBase58() === updatedPost.publicKey.toBase58()
              ? updatedPost
              : p
          )
        : []
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar username={profile?.username ?? ""} />

      <div className="max-w-[900px] mx-auto px-4 py-10">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 bg-gray-300 dark:bg-gray-700" />
            <Skeleton className="h-4 w-60 bg-gray-300 dark:bg-gray-700" />
            <Skeleton className="h-4 w-52 bg-gray-300 dark:bg-gray-700" />
          </div>
        ) : profile ? (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <p className="text-lg font-semibold">
                    Username:{" "}
                    <span className="text-primary">@{profile.username}</span>
                  </p>
                  <p className="text-md">
                    Wallet:{" "}
                    <a
                      href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                    >
                      {publicKey?.toBase58().slice(0, 4)}...
                      {publicKey?.toBase58().slice(-4)}
                    </a>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <StatBox label="Karma" value={profile.karma.toString()} />
                <StatBox label="Total Posts" value={profile.totalPosts.toString()} />
                <StatBox label="Upvotes" value={profile.totalUpvotes.toString()} />
                <StatBox label="Downvotes" value={profile.totalDownvotes.toString()} />
                <StatBox
                  label="Created At"
                  value={new Date(
                    profile.createdAt.toNumber() * 1000
                  ).toLocaleString()}
                />
              </div>
            </div>

            {userPosts && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Your Posts</h2>

                {userPosts.length === 0 ? (
                  <p className="text-gray-500">
                    You haven’t posted anything yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <div
                        key={post.publicKey.toBase58()}
                        className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm space-y-2"
                      >
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          <span className="font-medium">Created:</span>{" "}
                          {new Date(
                            post.account.createdAt * 1000
                          ).toLocaleString()}
                        </p>
                        <div className="text-sm text-gray-700 dark:text-gray-200">
                          <IPFSContent hash={post.account.ipfs_hash} />
                        </div>
                        <VoteControls
                          post={post}
                          program={program}
                          publicKey={publicKey}
                          onVoted={handlePostUpdate}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">No profile found for this wallet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;

const StatBox = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
    <p className="font-semibold">{label}</p>
    <p className="text-xl mt-1 break-all">{value}</p>
  </div>
);
