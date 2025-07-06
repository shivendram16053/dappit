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

export async function fetchPostsByUser(
  program: Program<Dappit>,
  userPublicKey: PublicKey
): Promise<PostAccount[] | false> {
  if (!program) {
    toast.error("Program not initialized");
    return false;
  }

  try {
    // Fetch all posts
    const postAccounts = await program.account.post.all();

    // Filter posts by creator
    const userPosts = postAccounts
      .filter((post) => post.account.creator.equals(userPublicKey))
      .map((post) => ({
        publicKey: post.publicKey,
        account: {
          creator: post.account.creator,
          ipfs_hash: post.account.ipfsHash,
          upvote: post.account.upvote.toNumber(),
          downvote: post.account.downvote.toNumber(),
          createdAt: post.account.createdAt.toNumber(),
        },
      }))
      .sort((a, b) => b.account.createdAt - a.account.createdAt);

    return userPosts;
  } catch (err: any) {
    console.error("fetchPostsByUser RPC Error:", err);
    toast.error(err?.message || "Failed to fetch user's posts");
    return false;
  }
}
