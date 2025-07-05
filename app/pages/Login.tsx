"create client"

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram } from "@/utils/setup";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/bar/Navbar";
import toast from "react-hot-toast";
import { registerUser } from "@/utils/functions/createUserProfile";

const Login = () => {
  const { program } = useProgram();
  const { publicKey } = useWallet();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!program || !publicKey) return;

      try {
        const [userPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_profile"), publicKey.toBuffer()],
          program.programId
        );

        //@ts-ignore
        const userProfile = await program.account.userProfile.fetch(userPda);
        if (userProfile) {
          router.push("/");
        }
      } catch (err:any) {
        console.log("no profile found")
      } finally {
        setCheckingProfile(false);
      }
    };

    checkUserProfile();
  }, [program, publicKey]);




  const handleRegister = async () => {
    setLoading(true);
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      if (!program) {
        toast.error("Program not initialized");
        return;
      }
      const success = await registerUser(program, publicKey, username,);

      if (!success) {
        throw new Error("Profile registration failed");
      }
      toast.success("Logged in successfully!");
      router.refresh();
    } catch (err: any) {
      console.error("handleRegister error:", err);
      toast.error("Something went wrong while registering");
    } finally{
      setLoading(false);
    }
  };



  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Checking profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl font-bold mb-4 mt-6">Create Your Dappit Profile</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          className="w-full max-w-md"
        >
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-md mb-2 w-full"
          />
          {publicKey && (
            <p className="text-sm text-muted-foreground mb-4">
              Connected wallet: {publicKey.toBase58().slice(0, 6)}...
              {publicKey.toBase58().slice(-4)}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || username.trim().length < 3}
            className={`px-6 py-2 rounded-md font-semibold w-full text-white hover:cursor-pointer ${loading || username.trim().length < 3
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary"
              }`}
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
