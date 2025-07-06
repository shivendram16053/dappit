"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Dashboard from "@/pages/Dashboard";

const DashboardPage = () => {
  const { connected } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = Cookies.get("username");

    if (!connected || !username) {
      router.replace("/");
    } else {
      setLoading(false);
    }
  }, [connected]);

  if (loading) {
    return <p className="text-center mt-10">Checking access...</p>;
  }

  return <Dashboard />;
};

export default DashboardPage;
