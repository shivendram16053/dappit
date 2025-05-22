use anchor_lang::prelude::*;


#[account]
#[derive(InitSpace)]

pub struct UserProfile {
    pub authority : Pubkey,
    #[max_len(32)]
    pub username : String,
    pub karma :u64,
    pub created_at:i64,
    pub total_posts:u64,
    pub total_upvotes :u64,
    pub total_downvotes:u64,
    pub bump:u8,
}