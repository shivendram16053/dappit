use anchor_lang::prelude::*;
use anchor_lang::solana_program::example_mocks::solana_sdk::system_program;
use anchor_lang::solana_program::{
    program::invoke_signed,
    rent::Rent,
    system_instruction::{create_account},
};

use crate::error::CustomError;
use crate::state::UserProfile;

#[derive(Accounts)]
pub struct CreateUserProfile<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = UserProfile::INIT_SPACE + 8,
        seeds = [b"user_profile", user.key().as_ref()],
        bump,
    )]
    pub user_pda: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"user_vault", user.key().as_ref()],
        bump,
    )]
    pub user_vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateUserProfile<'info> {
    pub fn create_profile(&mut self, username: String, bump: u8, vault_bump: u8) -> Result<()> {
        let user_profile_pda = &mut self.user_pda;

        user_profile_pda.set_inner(UserProfile {
            authority: *self.user.key,
            username,
            karma: 0,
            created_at: Clock::get()?.unix_timestamp,
            total_posts: 0,
            total_upvotes: 0,
            total_downvotes: 0,
            user_vault: *self.user_vault.key,
            vault_bump,
            bump,
            vote_bitmap: vec![0u8; 512], // initialize with 512 zeros
        });

        let deposit_amount = 40_000_000;

        require!(
            **self.user.lamports.borrow() >= deposit_amount,
            CustomError::InsufficientLamports
        );

        let rent = Rent::get()?;
        let required_lamports = rent.minimum_balance(0);

        let total_lamports = required_lamports + deposit_amount;

        let create_account_ix = create_account(
            self.user.key,
            self.user_vault.key,
            total_lamports,
            0,
            &system_program::ID,
        );

        invoke_signed(
            &create_account_ix,
            &[
                self.user.to_account_info(),
                self.user_vault.to_account_info(),
                self.system_program.to_account_info(),
            ],
            &[&[b"user_vault", self.user.key.as_ref(), &[vault_bump]]],
        )?;

        Ok(())
    }
}
