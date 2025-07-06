"use client";

import React from "react";
import { MessageSquare, User2 } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";

type NavbarProps = {
  username?: string;
};

const Navbar = ({ username }: NavbarProps) => {
  const { connected } = useWallet();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
        <div className={`w-full ${connected ? "max-w-[900px]" : "max-w-7xl"} flex items-center justify-between`}>
          <Link href={"/"}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-semibold tracking-tight">Dappit</span>
            </div>

          </Link>

          <div className="flex items-center space-x-4">
            {connected && username && (
              <Link href="/profile" className="flex items-center space-x-2 group cursor-pointer">
                <User2 className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-primary transition" />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition">
                  {username}
                </span>
              </Link>
            )}
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
