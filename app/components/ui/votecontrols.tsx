import { ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import type { Program } from "@coral-xyz/anchor";
import type { Dappit } from "@/idl/dappit";

type Props = {
  post: {
    publicKey: PublicKey;
    account: {
      creator: PublicKey;
      upvote: number;
      downvote: number;
      ipfs_hash: string;
    };
  };
  publicKey: PublicKey | null;
  program: Program<Dappit> | null;
  disabled?: boolean;
  onVoted?: (updatedPost: {
    publicKey: PublicKey;
    account: {
      creator: PublicKey;
      upvote: number;
      downvote: number;
      ipfs_hash: string;
      createdAt: number;
    };
  }) => void;
};

export const VoteControls = ({ post, publicKey, program, disabled, onVoted }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!publicKey || !program) {
      toast.error("Wallet not connected or program missing");
      return;
    }
    if (disabled) return;

    try {
      setLoading(true);

      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), publicKey.toBuffer()],
        program.programId
      );

      const txSig = await program.methods
        .voteOnPostHandler(post.account.ipfs_hash, type)
        .accounts({
          voter: publicKey,
          creator: post.account.creator,
          postPda: post.publicKey,
          //@ts-ignore
          userPda,
          systemProgram: PublicKey.default,
        })
        .rpc();

      toast.success(`${type === "upvote" ? "Upvoted" : "Downvoted"}! ✅`);
      console.log("vote tx", txSig);

      // Refetch only this post
      const updatedPost = await program.account.post.fetch(post.publicKey);
      onVoted?.({
        publicKey: post.publicKey,
        account: {
          creator: updatedPost.creator,
          upvote: Number(updatedPost.upvote),
          downvote: Number(updatedPost.downvote),
          ipfs_hash: updatedPost.ipfsHash,
          createdAt: Number(updatedPost.createdAt),
        },
      });
    } catch (err) {
      console.error("Vote failed:", err);
      toast.error("Failed to vote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-6 text-sm text-gray-700 dark:text-gray-300">
      <button
        onClick={() => handleVote("upvote")}
        disabled={disabled || loading}
        className="flex items-center gap-1 hover:text-orange-500 hover:cursor-pointer transition disabled:opacity-50"
      >
        <ArrowUp className="w-5 h-5" />
        <span>{post.account.upvote}</span>
      </button>
      <button
        onClick={() => handleVote("downvote")}
        disabled={disabled || loading}
        className="flex items-center gap-1 hover:text-blue-500 hover:cursor-pointer transition disabled:opacity-50"
      >
        <ArrowDown className="w-5 h-5" />
        <span>{post.account.downvote}</span>
      </button>
    </div>
  );
};
