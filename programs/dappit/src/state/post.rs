use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Post {
    pub creator: Pubkey,
    #[max_len(64)]
    pub ipfs_hash: String,
    pub upvote: u64,
    pub downvote: u64,
    pub created_at: i64,
    pub bump: u8,
}
