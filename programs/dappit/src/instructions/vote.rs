use crate::{error::CustomError, state::*};
use anchor_lang::prelude::*;
use sha2::{Digest, Sha256};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VoteType {
    Upvote,
    Downvote,
}

#[derive(Accounts)]
#[instruction(ipfs_hash: String)]
pub struct Vote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    /// CHECK
    #[account()]
    pub creator: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            b"post_pda",
            creator.key.as_ref(),
            &Sha256::digest(ipfs_hash.as_bytes())[..32]
        ],
        bump
    )]
    pub post_pda: Account<'info, Post>,

    #[account(
        mut,
        seeds = [b"user_profile",voter.key().as_ref()],
        bump
    )]
    pub user_pda: Account<'info, UserProfile>,

    pub system_program: Program<'info, System>,
}

impl<'info> Vote<'info> {
    fn get_vote_type_from_bitmap(bitmap: &[u8], index: usize) -> Option<VoteType> {
        let byte = bitmap.get(index / 4)?;
        let bits = (byte >> ((index % 4) * 2)) & 0b11;

        match bits {
            0b01 => Some(VoteType::Upvote),
            0b10 => Some(VoteType::Downvote),
            _ => None,
        }
    }

    fn set_vote_bit(bitmap: &mut [u8], index: usize, vote: VoteType) {
        let byte = &mut bitmap[index / 4];
        let shift = (index % 4) * 2;
        *byte &= !(0b11 << shift);
        let value = match vote {
            VoteType::Upvote => 0b01,
            VoteType::Downvote => 0b10,
        };
        *byte |= value << shift;
    }

    pub fn vote_on_post_handler(&mut self, ipfs_hash: String, vote: VoteType) -> Result<()> {
        let user = &mut self.user_pda;
        let post = &mut self.post_pda;
        let hash_bytes = Sha256::digest(ipfs_hash.as_bytes());
        let post_id = u64::from_le_bytes(
            hash_bytes[..8]
                .try_into()
                .map_err(|_| CustomError::InvalidHash)?,
        );

        let max_votes = user.vote_bitmap.len() * 4; // 512*4=2048 votes max
        let bit_index = (post_id % max_votes as u64) as usize;

        // no need to check out of bound because modulo is applied,
        // but you can add for safety:
        if bit_index >= max_votes {
            return Err(CustomError::InvalidPostId.into());
        }

        let current_vote = Self::get_vote_type_from_bitmap(&user.vote_bitmap, bit_index);

        match (current_vote, &vote) {
            (None, VoteType::Upvote) => {
                Self::set_vote_bit(&mut user.vote_bitmap, bit_index, VoteType::Upvote);
                post.upvote += 1;
                user.karma += 1;
            }
            (None, VoteType::Downvote) => {
                Self::set_vote_bit(&mut user.vote_bitmap, bit_index, VoteType::Downvote);
                post.downvote += 1;
                user.karma -= 1;
            }
            (Some(VoteType::Upvote), VoteType::Downvote) => {
                Self::set_vote_bit(&mut user.vote_bitmap, bit_index, VoteType::Downvote);
                post.upvote -= 1;
                post.downvote += 1;
                user.karma -= 2;
            }
            (Some(VoteType::Downvote), VoteType::Upvote) => {
                Self::set_vote_bit(&mut user.vote_bitmap, bit_index, VoteType::Upvote);
                post.downvote -= 1;
                post.upvote += 1;
                user.karma += 2;
            }
            _ => {} // No-op
        }

        Ok(())
    }
}
