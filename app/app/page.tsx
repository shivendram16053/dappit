"use client";

import React, { useEffect, useState } from "react";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { useWallet } from "@solana/wallet-adapter-react";
import { checkUserProfile } from "@/utils/functions/checkUserProfile";
import { useProgram } from "@/utils/setup";
import Cookies from "js-cookie";

const Page = () => {
  const { connected, publicKey } = useWallet();
  const { program } = useProgram();

  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!connected || !publicKey) {
        Cookies.remove("username");
        setUsername(null);
        setLoading(false);
        return;
      }

      const cachedUsername = Cookies.get("username");
      if (cachedUsername) {
        setUsername(cachedUsername);
        setLoading(false);
        return;
      }

      try {
        if (!program) return;

        const profile = await checkUserProfile(program, publicKey, setLoading);
        if (profile?.username) {
          Cookies.set("username", profile.username, { expires: 7 }); // 7 days expiry
          setUsername(profile.username);
        } else {
          Cookies.remove("username");
          setUsername(null);
        }
      } catch (err) {
        console.error("Profile check failed:", err);
        Cookies.remove("username");
        setUsername(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [connected, publicKey, program]);

  if (loading) return <p className="text-center mt-8 text-gray-500">Loading...</p>;

  return (
    <>
      {!connected && !username && <LandingPage />}
      {connected && !username && <Login />}
      {connected && username && <Dashboard />}
    </>
  );
};

export default Page;
