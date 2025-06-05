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
  let voter_profile:anchor.web3.PublicKey;
  let voter_profile_bump:number;
  let voter_vault:anchor.web3.PublicKey;
  let voter_vault_bump:number;
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
    [voter_profile , voter_profile_bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_profile"),
        voter.publicKey.toBuffer()
      ],
      program.programId
    );

    [voter_vault,voter_vault_bump]=anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_vault"),
        voter.publicKey.toBuffer(),
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
    } catch (error) {
      console.error("Error while creating user_profile:", error);
      throw error;
    }
  });

  it("Should Initialize voter_profile_pda and voter_vault", async () => {
  try {
    const tx = await program.methods
      .userProfile("shibu0xsol")
      .accounts({
        user: voter.publicKey,
        //@ts-ignore
        userPda: voter_profile,
        userVault: voter_vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

      console.log("this is the transaction",tx)

      const voterProfileAccount = await program.account.userProfile.fetch(voter_profile);
    
      const vaultBalance = await program.provider.connection.getBalance(voter_vault);
      const now = Math.floor(Date.now() / 1000);

      // Assertions
      assert.strictEqual(voterProfileAccount.username, "shibu0xsol", "Username is not correctly set.");
      assert.ok(voterProfileAccount.authority.equals(voter.publicKey), "Authority is not set correctly.");
      assert.ok(voterProfileAccount.userVault.equals(voter_vault), "User vault not set correctly.");
      assert.ok(vaultBalance >= 40_000_000, `User vault balance (${vaultBalance}) is less than 0.04 SOL`);
      assert.strictEqual(voterProfileAccount.karma.toNumber(), 0, "Karma should be 0");
      assert.strictEqual(voterProfileAccount.totalPosts.toNumber(), 0, "Total posts should be 0");
      assert.strictEqual(voterProfileAccount.totalUpvotes.toNumber(), 0, "Total upvotes should be 0");
      assert.strictEqual(voterProfileAccount.totalDownvotes.toNumber(), 0, "Total downvotes should be 0");
      assert.strictEqual(voterProfileAccount.voteBitmap.length, 512, "vote_bitmap length mismatch");
      assert.ok(voterProfileAccount.voteBitmap.every(b => b === 0), "vote_bitmap is not zeroed");
      assert.ok(Math.abs(voterProfileAccount.createdAt.toNumber() - now) < 30, "created_at is not recent");
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
    const userPdaAccount = await program.account.userProfile.fetch(user_profile);


    assert.ok(postPdaAccount.creator.equals(user.publicKey),"Creator of the post is not correct");
    assert.strictEqual(postPdaAccount.ipfsHash,ipfs_hash,"Ipfs hash not storing correctly");
    assert.strictEqual(postPdaAccount.upvote.toNumber(),0,"Upvotes should be 0");
    assert.strictEqual(postPdaAccount.downvote.toNumber(),0,"Downvotes should be 0");
    assert.ok(Math.abs(postPdaAccount.createdAt.toNumber() - now) < 30, "created_at is not recent");
    assert.strictEqual(userPdaAccount.totalPosts.toNumber(),1,"Total Post should increase by 1");
    assert.strictEqual(userPdaAccount.karma.toNumber(),2,"User karma should increse by 2")
  })

  it("Should be able to upvote the post",async()=>{
     const txSig = await program.methods
      .voteOnPostHandler(ipfs_hash,"upvote")
      .accounts({
        voter:voter.publicKey,
        creator:user.publicKey,
        postPda:post_pda,
        // @ts-ignore
        userPda:voter_profile,
        systemProgram:anchor.web3.SystemProgram.programId,
      })
      .signers([voter])
      .rpc()

    console.log("tx for voting",txSig);

    const postPdaAccount = await program.account.post.fetch(post_pda);
    const userPdaAccount = await program.account.userProfile.fetch(voter_profile);


    assert.strictEqual(userPdaAccount.totalUpvotes.toNumber(),1,"The upvote should have increased for user pda");
    assert.strictEqual(postPdaAccount.upvote.toNumber(),1,"The upvote should have increased for post pda");
    assert.strictEqual(userPdaAccount.totalUpvotes.toNumber(),1,"The upvotes should be up for user");
    assert.strictEqual(postPdaAccount.downvote.toNumber(), 0, "Downvotes should remain 0");
    assert.strictEqual(userPdaAccount.totalDownvotes.toNumber(), 0, "User downvotes should remain 0");
    assert.strictEqual(userPdaAccount.karma.toNumber(),1,"voter karma should incraese by 1")

  })


  it("Should be able to downvote the post",async()=>{
    const provider = anchor.getProvider();

    const voter2 = anchor.web3.Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        voter2.publicKey,
        anchor.web3.LAMPORTS_PER_SOL * 10
      ),
      "confirmed"
    );

    const [voter2Profile,voter2Bump]= await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_profile"),
        voter2.publicKey.toBuffer()
      ],program.programId
    );
    const [voter2Vault,voter2VaultBump]= await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_vault"),
        voter2.publicKey.toBuffer()
      ],program.programId
    );

    const profileTx = await program.methods
     .userProfile("avhidotsol")
     .accounts({
      user:voter2.publicKey,
      //@ts-ignore
      userPda:voter2Profile,
      userVault:voter2Vault,
      systemProgram:anchor.web3.SystemProgram.programId,
     })
     .signers([voter2])
     .rpc();

     const postTx = await program.methods
      .voteOnPostHandler(ipfs_hash,"downvote")
      .accounts({
        voter:voter2.publicKey,
        creator:user.publicKey,
        postPda:post_pda,
        // @ts-ignore
        userPda:voter2Profile,
        systemProgram:anchor.web3.SystemProgram.programId
      })
      .signers([voter2])
      .rpc();

    console.log("downvote tx by 2nd voter",postTx)

    const postPdaAccount = await program.account.post.fetch(post_pda);
    const userPdaAccount = await program.account.userProfile.fetch(voter2Profile);

    assert.strictEqual(postPdaAccount.upvote.toNumber(),1,"Upvote should not change");
    assert.strictEqual(postPdaAccount.downvote.toNumber(),1,"Downvote should change to 1");
    assert.strictEqual(userPdaAccount.totalDownvotes.toNumber(),1,"Downvote of user should increase");
    assert.strictEqual(userPdaAccount.karma.toNumber(),1,"user karma should increase")
    
  })

  it("voter can flip his vote",async()=>{
    const txSig = await program.methods
      .voteOnPostHandler(ipfs_hash,"downvote")
      .accounts({
        voter:voter.publicKey,
        creator:user.publicKey,
        postPda:post_pda,
        // @ts-ignore
        userPda:voter_profile,
        systemProgram:anchor.web3.SystemProgram.programId,
      })
      .signers([voter])
      .rpc()

    console.log("tx for voting",txSig);

    const postPdaAccount = await program.account.post.fetch(post_pda);
    const userPdaAccount = await program.account.userProfile.fetch(voter_profile);


    assert.strictEqual(userPdaAccount.totalUpvotes.toNumber(),0,"The upvote should have decreased for user pda");
    assert.strictEqual(userPdaAccount.totalDownvotes.toNumber(),1,"The downvote should have increased for user pda");
    assert.strictEqual(postPdaAccount.upvote.toNumber(),0,"The upvote should have decreased for post pda");
    assert.strictEqual(postPdaAccount.downvote.toNumber(), 2, "Downvotes should increase +1");
  })
});
