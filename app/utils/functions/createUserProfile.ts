import { PublicKey, SystemProgram } from "@solana/web3.js";
import toast from "react-hot-toast";
import type { Program } from "@coral-xyz/anchor";
import type { Dappit } from "@/idl/dappit";

export async function registerUser(
  program: Program<Dappit>,
  publicKey: PublicKey,
  username: string,
) {
  if (!program) {
    toast.error("Program not initialized");
    return false;
  }

  if (!publicKey) {
    toast.error("Wallet not connected");
    return false;
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 3) {
    toast.error("Username too short");
    return false;
  }

  try {

    const [userPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), publicKey.toBuffer()],
      program.programId
    );

    const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_vault"), publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .userProfile(trimmedUsername)
      .accounts({
        user: publicKey,
        //@ts-ignore
        userPda,
        userVault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    toast.success("Profile created!");
    return tx;
  } catch (err: any) {
    console.error("registerUser RPC Error:", err);
    toast.error(err?.message || "Profile creation failed");
    return false;
  }
}
