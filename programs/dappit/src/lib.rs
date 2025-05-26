use anchor_lang::prelude::*;

declare_id!("HCqcWhgw4SCm1wdMYgbzi9npvssyoVUFRSX3tnGovnrv");

mod error;
mod instructions;
mod state;

use instructions::*;

#[program]
pub mod reddit_dapp {

    pub use super::*;

    pub fn user_profile(ctx: Context<CreateUserProfile>, username: String) -> Result<()> {
        let bump = ctx.bumps.user_pda;
        let vault_bump = ctx.bumps.user_vault;
        ctx.accounts.create_profile(username, bump,vault_bump)
    }
}
