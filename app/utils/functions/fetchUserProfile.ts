import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import type { Program } from "@coral-xyz/anchor";
import type { Dappit } from "@/idl/dappit";

export async function fetchUserProfile(
  program: Program<Dappit>,
  publicKey: PublicKey
): Promise<any | false> {
  if (!program || !publicKey) {
    toast.error("Program or public key not initialized");
    return false;
  }

  try {
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), publicKey.toBuffer()],
      program.programId
    );

    const userProfile = await program.account.userProfile.fetch(userPda);
    return userProfile;
  } catch (err: any) {
    console.error("fetchUserProfile RPC Error:", err);
    toast.error(err?.message || "Failed to fetch profile");
    return false;
  }
}
