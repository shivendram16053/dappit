use anchor_lang::prelude::*;

declare_id!("3PowFT1sQGcwNM1MtAkVaWRgpHru5xKeQezYTPBrDCPk");

mod error;
mod instructions;
mod state;

use instructions::*;

#[program]
pub mod dappit {

    use crate::error::CustomError;

    pub use super::*;

    pub fn user_profile(ctx: Context<CreateUserProfile>, username: String) -> Result<()> {
        let bump = ctx.bumps.user_pda;
        let vault_bump = ctx.bumps.user_vault;
        ctx.accounts.create_profile(username, bump,vault_bump)
    }

    pub fn create_post(ctx:Context<PostPDA>,ipfs_hash:String) -> Result<()>{
        let post_bump = ctx.bumps.post_pda;
        ctx.accounts.create_post(ipfs_hash, post_bump)
    }

    pub fn vote_on_post_handler(ctx: Context<Vote>,ipfs_hash:String,vote:String)->Result<()>{
        let vote_map = match vote.to_lowercase().as_str() {
            "upvote"=>VoteType::Upvote,
            "downvote"=>VoteType::Downvote,
            _ => return Err(CustomError::InvalidVoteType.into()), 
        };
        ctx.accounts.vote_on_post_handler(ipfs_hash,vote_map)
    
    }
}
