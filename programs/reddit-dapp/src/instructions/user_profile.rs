use crate::state::UserProfile;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateUserProfile<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer=user,
        space=UserProfile::INIT_SPACE +8,
        seeds =[b"user_profile",user.key().as_ref()],
        bump,
    )]
    pub user_pda: Account<'info, UserProfile>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateUserProfile<'info> {
    pub fn create_profile(&mut self, username: String, bump: u8) -> Result<()> {
        let user_profile_pda = &mut self.user_pda;

        user_profile_pda.set_inner(UserProfile {
            authority: *self.user.key,
            username: username,
            karma: 0,
            created_at: Clock::get()?.unix_timestamp,
            total_posts: 0,
            total_upvotes: 0,
            total_downvotes: 0,
            bump: bump,
        });

        Ok(())
    }
}
