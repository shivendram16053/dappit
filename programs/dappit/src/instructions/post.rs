use crate::state::*;
use anchor_lang::prelude::*;
use sha2::{Sha256, Digest};

#[derive(Accounts)]
#[instruction(ipfs_hash: String)]
pub struct PostPDA<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

     #[account(
        mut,
        seeds = [b"user_profile",creator.key().as_ref()],
        bump
    )]
    pub user_pda: Account<'info, UserProfile>,

    #[account(
        init,
        payer = creator,
        space = 8 + Post::INIT_SPACE,
        seeds = [
            b"post_pda",
            creator.key().as_ref(),
            &Sha256::digest(ipfs_hash.as_bytes())[..32]
        ],
        bump
    )]
    pub post_pda: Account<'info, Post>,

    pub system_program: Program<'info, System>,
}

impl<'info> PostPDA<'info> {
    pub fn create_post(&mut self, ipfs_hash: String, bump: u8) -> Result<()> {
        self.post_pda.set_inner(Post {
            creator: self.creator.key(),
            ipfs_hash,
            upvote: 0,
            downvote: 0,
            created_at: Clock::get()?.unix_timestamp,
            bump,
        });

        self.user_pda.karma+=2;
        self.user_pda.total_posts+=1;

        Ok(())
    }
}
