use anchor_lang::error_code;

#[error_code]
pub enum CustomError{
    #[msg("You don't have enough sol to deposit")]
    InsufficientLamports,
}