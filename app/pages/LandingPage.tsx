"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Zap, Users } from "lucide-react"

export default function LandingPage() {
  const { connected, disconnect, publicKey } = useWallet()

  const features = [
    {
      icon: MessageSquare,
      title: "Censorship Resistant",
      desc: "Post your thoughts freely. No central control.",
    },
    {
      icon: Users,
      title: "Community Owned",
      desc: "Decisions and rewards governed by users.",
    },
    {
      icon: Zap,
      title: "Fast & Cheap",
      desc: "Solana makes every action instant and low cost.",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-between">
      {/* Header */}
      <header className="w-full py-6 px-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <span className="text-2xl font-bold">Dappit</span>
        </div>
        <WalletMultiButton/>
      </header>

      {/* Hero */}
      <main className="flex-1 w-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6">
          A Decentralized Social <br />
          <span className="text-primary">Built on Solana</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-10">
          Own your voice. Vote, post, and earn in a censorship-resistant social app.
        </p>

        {!connected && (
          <WalletMultiButton/>
        )}
      </main>

      {/* Features */}
      <section className="w-full py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-muted-foreground mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center text-sm py-6 text-muted-foreground border-t">
        © 2024 Dappit. Made with ❤️ on Solana.
      </footer>
    </div>
  )
}
