import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useQuery } from "@tanstack/react-query";

import { readonlyProgram } from "./useProgram";
import { getConfigPda, getRoundPda } from "./pda";

export type RoundStatus = "open" | "full" | "settled";

export interface RoundDetails {
  roundNumber: BN;
  slots: number;
  slotsFilled: number;
  pool: BN;
  status: RoundStatus;
  ticketPrice: BN;
  participants: PublicKey[];
  winningParticipants: PublicKey[];
  firstWinnerIdx: number;
  secondWinnersStartIdx: number;
  thirdWinnersStartIdx: number;
  firstPrize: BN;
  secondPrizeEach: BN;
  thirdPrizeEach: BN;
  fee: BN;
}

async function fetchRound(): Promise<RoundDetails> {
  const programId = readonlyProgram.programId;

  const configPda = getConfigPda(programId);

  const config = await readonlyProgram.account.lotteryConfig.fetch(configPda);
  const currentRound = config.currentRound as unknown as BN;

  const roundPda = getRoundPda(programId, configPda, currentRound);

  const data = await readonlyProgram.account.round.fetch(roundPda);
  const status = Object.keys(data.status)[0] as RoundStatus;

  return {
    roundNumber: data.roundNumber as unknown as BN,
    slots: data.slots,
    slotsFilled: data.slotsFilled,
    pool: data.pool as unknown as BN,
    status,
    ticketPrice: data.ticketPrice as unknown as BN,
    participants: data.participants as PublicKey[],
    winningParticipants: data.winningParticipants as PublicKey[],
    firstWinnerIdx: data.firstWinnerIdx,
    secondWinnersStartIdx: data.secondWinnersStartIdx,
    thirdWinnersStartIdx: data.thirdWinnersStartIdx,
    firstPrize: data.firstPrize as unknown as BN,
    secondPrizeEach: data.secondPrizeEach as unknown as BN,
    thirdPrizeEach: data.thirdPrizeEach as unknown as BN,
    fee: data.fee as unknown as BN,
  };
}

export function useRound() {
  return useQuery({
    queryKey: ["round"],
    queryFn: fetchRound,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}
