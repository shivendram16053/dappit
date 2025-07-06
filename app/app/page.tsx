"use client";

import React, { useEffect, useRef, useState } from "react";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import { useWallet } from "@solana/wallet-adapter-react";
import { checkUserProfile } from "@/utils/functions/checkUserProfile";
import { useProgram } from "@/utils/setup";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const Page = () => {
  const { connected, publicKey } = useWallet();
  const { program } = useProgram();
  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const didCheckRef = useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!connected || !publicKey || !program) {
        Cookies.remove("username");
        setUsername(null);
        setLoading(false);
        return;
      }

      if (didCheckRef.current) return;
      didCheckRef.current = true;

      const cachedUsername = Cookies.get("username");
      if (cachedUsername) {
        setUsername(cachedUsername);
        setLoading(false);
        router.replace("/dashboard");
        return;
      }

      try {
        const profile = await checkUserProfile(program, publicKey, setLoading);
        if (profile?.username) {
          Cookies.set("username", profile.username, { expires: 7 });
          setUsername(profile.username);
          router.replace("/dashboard");
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

  if (!connected) return <LandingPage />;
  if (connected && !username) return <Login />;

  return null;
};

export default Page;
