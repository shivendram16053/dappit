import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import type { Program } from "@coral-xyz/anchor";
import type { Dappit } from "@/idl/dappit";

export type PostAccount = {
  publicKey: PublicKey;
  account: {
    creator: PublicKey;
    ipfs_hash: string;
    upvote: number;
    downvote: number;
    createdAt: number;
  };
};

export async function fetchAllPosts(
  program: Program<Dappit>
): Promise<PostAccount[] | false> {
  if (!program) {
    toast.error("Program not initialized");
    return false;
  }

  try {
    const postAccounts = await program.account.post.all();
    const formattedPosts = postAccounts.map((post) => ({
      publicKey: post.publicKey,
      account: {
        creator: post.account.creator,
        ipfs_hash: post.account.ipfsHash,
        upvote: post.account.upvote.toNumber(),
        downvote: post.account.downvote.toNumber(),
        createdAt: post.account.createdAt.toNumber(),
      },
    })).sort((a, b) => b.account.createdAt - a.account.createdAt);

    return formattedPosts;
  } catch (err: any) {
    console.error("fetchAllPosts RPC Error:", err);
    toast.error(err?.message || "Failed to fetch posts");
    return false;
  }
}
