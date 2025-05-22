use anchor_lang::prelude::*;

declare_id!("9X2dUhxQaKzATkvL7XQdSME1geQM7JmX3odyUmXugZKm");

mod instructions;
mod state;

use instructions::*;

#[program]
pub mod reddit_dapp {

    pub use super::*;

    pub fn user_profile(ctx: Context<CreateUserProfile>, username: String) -> Result<()> {
        let bump = ctx.bumps.user_pda;
        ctx.accounts.create_profile(username, bump)
    }

    pub fn create_merkle_pda(
        ctx: Context<CreateMerkleRoot>,
        root: String,
        batch_id: u64,
        total_posts: u16,
    ) -> Result<()> {
        let bump = ctx.bumps.merkle_batch_pda;
        ctx.accounts
            .create_merkle_root(root, batch_id, total_posts, bump)
    }
}
