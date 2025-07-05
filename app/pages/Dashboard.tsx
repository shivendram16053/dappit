"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import Navbar from "@/components/ui/bar/Navbar";
import Sidebar from "@/components/ui/bar/Sidebar";
import { useProgram } from "@/utils/setup";
import { PublicKey } from "@solana/web3.js";

const Dashboard = () => {
  const { publicKey, connected } = useWallet();
  const { program } = useProgram();

  const [username, setUsername] = useState<string>("");
  const [karma, setKarma] = useState<number>(0);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch user profile on-chain
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

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserProfile();
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
      <Navbar />
      <div className="flex flex-1">
        <Sidebar username={username} karma={karma} />
        <main className="flex-grow p-8 bg-gray-50 dark:bg-gray-900">
          <h1 className="text-3xl font-bold mb-6">
            Welcome, {loadingProfile ? "Loading..." : username || "User"}!
          </h1>

          {/* Placeholder for posts or other dashboard content */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
            <p className="text-gray-500">No posts yet. Start by creating your first post!</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
