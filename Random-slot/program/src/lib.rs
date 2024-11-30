use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg,
    program_error::ProgramError, pubkey::Pubkey,
};

// Entry point for the program
entrypoint!(process_instruction);

// Process instruction function
fn process_instruction(
    _program_id: &Pubkey,      // Program ID
    _accounts: &[AccountInfo], // Account Info (not used here)
    instruction_data: &[u8],   // Instruction data
) -> ProgramResult {
    // Step 1: Parse the two numbers from the instruction data
    if instruction_data.len() < 16 {
        msg!("Instruction data must be at least 16 bytes long");
        return Err(ProgramError::InvalidInstructionData);
    }

    // Extract first and second numbers as u64 from instruction_data
    let first_number = u64::from_le_bytes(
        instruction_data[0..8]
            .try_into()
            .map_err(|_| ProgramError::InvalidInstructionData)?,
    );
    let second_number = u64::from_le_bytes(
        instruction_data[8..16]
            .try_into()
            .map_err(|_| ProgramError::InvalidInstructionData)?,
    );
    let max_tickets = u32::from_le_bytes(instruction_data[16..20].try_into().unwrap()) as u64;

    msg!("First number [last SLOT #]: {}", first_number);
    msg!("Second number [generatedLogical]: {}", second_number);
    msg!("Total Tickets: {}", max_tickets);

    let mixed_value = first_number ^ second_number;
    msg!("mixed_value: {}", mixed_value);

    let shifted_value = (mixed_value << 5).wrapping_add(mixed_value >> 3);
    msg!("shifted_value: {}", shifted_value);

    let random_number = (shifted_value % max_tickets) as u64;

    // Step 5: Ensure the result is positive (in case of negative wrapping)
    let final_number = if random_number < 0 {
        random_number + max_tickets
    } else {
        random_number
    };

    msg!("Generated random number: {}", final_number);

    Ok(())
}
