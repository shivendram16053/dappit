import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Dappit } from "../target/types/dappit";
import { sha256 } from "js-sha256";
import { assert } from "chai";

describe("dappit", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.dappit as Program<Dappit>;

  let user = anchor.web3.Keypair.generate();
  let user_profile: anchor.web3.PublicKey;
  let user_vault : anchor.web3.PublicKey;
  let post_pda : anchor.web3.PublicKey;
  let voter = anchor.web3.Keypair.generate();
  let user_profile_bump:number;
  let user_vault_bump:number;
  let post_pda_bump:number;
  let ipfs_hash = "QmRJzSVr4mRkWbPQpMZVKRwU1tRpbZk1pRhRbzZkW7PFSL";

  before(async()=>{
    const provider = anchor.getProvider();

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        user.publicKey,
        anchor.web3.LAMPORTS_PER_SOL *10,
      )
    )
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        voter.publicKey,
        anchor.web3.LAMPORTS_PER_SOL * 10
      ),
      "confirmed"
    );

    [user_profile , user_profile_bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_profile"),
        user.publicKey.toBuffer()
      ],
      program.programId
    );

    [user_vault,user_vault_bump]=anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_vault"),
        user.publicKey.toBuffer(),
      ],
      program.programId,
    );

    [post_pda,post_pda_bump]=anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("post_pda"),
        user.publicKey.toBuffer(),
        Buffer.from(sha256.array(ipfs_hash))
      ],
      program.programId
    )
  })

  it("Should Initialize user_profile_pda and user_vault", async () => {
  try {
    const tx = await program.methods
      .userProfile("shibu0x")
      .accounts({
        user: user.publicKey,
        //@ts-ignore
        userPda: user_profile,
        userVault: user_vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

      console.log("this is the transaction",tx)

      const userProfileAccount = await program.account.userProfile.fetch(user_profile);
    
      const vaultBalance = await program.provider.connection.getBalance(user_vault);
      const now = Math.floor(Date.now() / 1000);

      // Assertions
      assert.strictEqual(userProfileAccount.username, "shibu0x", "Username is not correctly set.");
      assert.ok(userProfileAccount.authority.equals(user.publicKey), "Authority is not set correctly.");
      assert.ok(userProfileAccount.userVault.equals(user_vault), "User vault not set correctly.");
      assert.ok(vaultBalance >= 40_000_000, `User vault balance (${vaultBalance}) is less than 0.04 SOL`);
      assert.strictEqual(userProfileAccount.karma.toNumber(), 0, "Karma should be 0");
      assert.strictEqual(userProfileAccount.totalPosts.toNumber(), 0, "Total posts should be 0");
      assert.strictEqual(userProfileAccount.totalUpvotes.toNumber(), 0, "Total upvotes should be 0");
      assert.strictEqual(userProfileAccount.totalDownvotes.toNumber(), 0, "Total downvotes should be 0");
      assert.strictEqual(userProfileAccount.voteBitmap.length, 512, "vote_bitmap length mismatch");
      assert.ok(userProfileAccount.voteBitmap.every(b => b === 0), "vote_bitmap is not zeroed");
      assert.ok(Math.abs(userProfileAccount.createdAt.toNumber() - now) < 30, "created_at is not recent");
      assert.equal(userProfileAccount.username,"shibu0x","Username not stored");
    } catch (error) {
      console.error("Error while creating user_profile:", error);
      throw error;
    }
  });

  it("Should create a post_pda in when user posts",async()=>{
    const tx = await program.methods
      .createPost(ipfs_hash)
      .accounts({
        creator:user.publicKey,
        postPda:post_pda,
        //@ts-ignore
        systemProgram :anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Post pda creation transaction",tx);

    const postPdaAccount = await program.account.post.fetch(post_pda);
    const now = Math.floor(Date.now() / 1000);


    assert.ok(postPdaAccount.creator.equals(user.publicKey),"Creator of the post is not correct");
    assert.strictEqual(postPdaAccount.ipfsHash,ipfs_hash,"Ipfs hash not storing correctly");
    assert.strictEqual(postPdaAccount.upvote.toNumber(),0,"Upvotes should be 0");
    assert.strictEqual(postPdaAccount.downvote.toNumber(),0,"Downvotes should be 0");
    assert.ok(Math.abs(postPdaAccount.createdAt.toNumber() - now) < 30, "created_at is not recent");
  })
});
