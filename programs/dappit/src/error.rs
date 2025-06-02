use anchor_lang::error_code;

#[error_code]
pub enum CustomError{
    #[msg("You don't have enough sol to deposit")]
    InsufficientLamports,
    #[msg("Invalid post ID derived from hash.")]
    InvalidPostId,
    #[msg("Invalid IPFS hash format.")]
    InvalidHash,
    #[msg("Self voting is not allowed.")]
    SelfVotingNotAllowed,
    #[msg("Vote type not valid")]
    InvalidVoteType,
}