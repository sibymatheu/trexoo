import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export function getConfigPda(programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId,
  );
  return pda;
}

export function getRoundPda(programId: PublicKey, configPda: PublicKey, roundNumber: BN): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("round"),
      configPda.toBuffer(),
      roundNumber.toArrayLike(Buffer, "le", 8),
    ],
    programId,
  );
  return pda;
}

export function getRoundVaultPda(programId: PublicKey, configPda: PublicKey, roundNumber: BN): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("round_vault"),
      configPda.toBuffer(),
      roundNumber.toArrayLike(Buffer, "le", 8),
    ],
    programId,
  );
  return pda;
}

export function getTicketPda(programId: PublicKey, roundPda: PublicKey, buyer: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("ticket"), roundPda.toBuffer(), buyer.toBuffer()],
    programId,
  );
  return pda;
}

export function getClaimRecordPda(programId: PublicKey, roundPda: PublicKey, claimer: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("claim"), roundPda.toBuffer(), claimer.toBuffer()],
    programId,
  );
  return pda;
}

export function getUserBalancePda(programId: PublicKey, user: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_balance"), user.toBuffer()],
    programId,
  );
  return pda;
}

export function getUserBalanceVaultPda(programId: PublicKey, user: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_balance_vault"), user.toBuffer()],
    programId,
  );
  return pda;
}
