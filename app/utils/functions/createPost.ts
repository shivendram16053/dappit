import { Dappit } from "@/idl/dappit";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { sha256 } from "js-sha256";
import toast from "react-hot-toast";

export async function createPost(
  program: Program<Dappit>,
  publicKey: PublicKey,
  ipfs_hash: string,
  setPosting: (v: boolean) => void
) {
  if (!program) throw new Error("program id required");

  if (!publicKey) throw new Error("user publickey is required");

  if (!ipfs_hash) throw new Error("ipfs_hash required");

  setPosting(true);

  try {
    const [post_pda, post_bump] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("post_pda"),
        publicKey.toBuffer(),
        Buffer.from(sha256.array(ipfs_hash)),
      ],
      program.programId
    );

    const tx =  await program.methods
     .createPost(ipfs_hash)
     .accounts({
        creator: publicKey,
        postPda: post_pda,
        //@ts-ignore
        systemProgram: SystemProgram.programId,
     })
     .rpc();

     toast.success("post creation success")
     return tx;
  } catch (err: any) {
    console.error("postCreation RPC Error:", err);
    toast.error(err?.message || "Post creation failed");
    return false;
  } finally {
    setPosting(false);
  }
}
