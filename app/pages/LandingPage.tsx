"use client"

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { MessageSquare, Zap, Users } from "lucide-react";
import Navbar from "@/components/ui/bar/Navbar";

export default function LandingPage() {
  const { connected } = useWallet();

  const features = [
    {
      icon: MessageSquare,
      title: "Censorship Resistant",
      desc: "Post your thoughts freely. No central control.",
    },
    {
      icon: Users,
      title: "Community Owned",
      desc: "No deletions. What you post stays yours.",
    },
    {
      icon: Zap,
      title: "Fast & Cheap",
      desc: "Solana makes every action instant and low-cost.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
          The Decentralized Reddit-Style <br />
          <span className="text-primary">Built on Solana</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-10">
          Own your voice. Post freely in a censorship-resistant, community-owned social platform.
        </p>

        {!connected && (
          <div className="mb-6">
            <WalletMultiButton />
          </div>
        )}

        {connected && (
          <p className="text-sm text-muted-foreground">
            Wallet connected. You're ready to post.
          </p>
        )}
      </main>

      {/* Features Section */}
      <section className="w-full bg-muted/10 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4 shadow-sm">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center text-sm py-6 text-muted-foreground border-t">
        © 2025 Dappit — Made with ❤️ on Solana
      </footer>
    </div>
  );
}
