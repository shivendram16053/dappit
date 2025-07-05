import { PublicKey } from "@solana/web3.js";
import type { Program } from "@coral-xyz/anchor";
import type { Dappit } from "@/idl/dappit";

export async function checkUserProfile(
  program: Program<Dappit>,
  publicKey: PublicKey,
  setCheckingProfile: (v: boolean) => void
) {
  if (!program || !publicKey) return;
  setCheckingProfile(true);

  try {
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), publicKey.toBuffer()],
      program.programId
    );


    //@ts-ignore
    const userProfile = await program.account.userProfile.fetch(userPda);
    return userProfile;
  } catch (err) {
    console.log("No profile found, show login.",err);
  } finally {
    setCheckingProfile(false);
  }
}
