use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct MerkleRoot{
    #[max_len(64)]
    pub root:String,
    pub batch_id:u64,
    pub created_at:i64,
    pub total_posts:u16,
    pub created_by:Pubkey,
    pub bump:u8,

}