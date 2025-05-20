use anchor_lang::prelude::*;

declare_id!("9X2dUhxQaKzATkvL7XQdSME1geQM7JmX3odyUmXugZKm");

#[program]
pub mod reddit_dapp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
