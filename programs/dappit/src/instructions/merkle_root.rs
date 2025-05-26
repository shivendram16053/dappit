use anchor_lang::prelude::*;
use crate::state::MerkleRoot;

#[derive(Accounts)]
#[instruction(batch_id:u64)]
pub struct CreateMerkleRoot<'info>{
    #[account(mut)]
    pub relayer:Signer<'info>,


    #[account(
        init,
        payer=relayer,
        space = MerkleRoot::INIT_SPACE + 8,
        seeds = [b"merkle_root",relayer.key().as_ref(),&batch_id.to_le_bytes()],
        bump,
    )]
    pub merkle_batch_pda : Account<'info,MerkleRoot>,

    pub system_program:Program<'info,System>,
}

impl<'info> CreateMerkleRoot<'info>{
    pub fn create_merkle_root(&mut self, root:String,batch_id:u64,total_posts:u16,bump:u8)-> Result<()>{

        let merkle_root_pda = &mut self.merkle_batch_pda;

        merkle_root_pda.set_inner(MerkleRoot{
            root:root,
            batch_id:batch_id,
            created_at:Clock::get()?.unix_timestamp,
            total_posts:total_posts,
            created_by:*self.relayer.key,
            bump:bump,
        });
        Ok(())
    }
}
