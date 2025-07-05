"use client";

import React, { useEffect, useState } from 'react';
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import { useWallet } from '@solana/wallet-adapter-react';
import { checkUserProfile } from '@/utils/functions/checkUserProfile';
import { useProgram } from '@/utils/setup';

const Page = () => {
  const { connected, publicKey } = useWallet();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const {program}= useProgram();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!publicKey) {
        localStorage.removeItem("username");
        setUsername(null);
        setLoading(false);
        return;
      }

      try {
        if (!program) {
          setLoading(false);
          return;
        }
        const profile = await checkUserProfile(program, publicKey, setLoading);
        if (profile?.username) {
          localStorage.setItem("username", profile.username);
          setUsername(profile.username);
        } else {
          localStorage.removeItem("username");
          setUsername(null);
        }
      } catch (err) {
        console.error("Profile check failed:", err);
        localStorage.removeItem("username");
        setUsername(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [connected, publicKey]);

  return (
    <>
      {!connected && !username && <LandingPage />}
      {connected && !username && <Login />}
      {connected && username && <Dashboard />}
    </>
  );
};

export default Page;
