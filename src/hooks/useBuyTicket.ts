import { BN } from "@coral-xyz/anchor";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useProgram } from "./useProgram";
import { getConfigPda, getRoundPda, getRoundVaultPda, getTicketPda } from "./pda";

export function useBuyTicket() {
  const { program } = useProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slotIndex: number) => {
      if (!program) throw new Error("Wallet not connected");

      const programId = program.programId;
      const buyer = program.provider.publicKey!;

      const configPda = getConfigPda(programId);
      const config = await program.account.lotteryConfig.fetch(configPda);
      const currentRound = config.currentRound as unknown as BN;
      const nextRound = currentRound.addn(1);

      const roundPda = getRoundPda(programId, configPda, currentRound);
      const roundVaultPda = getRoundVaultPda(programId, configPda, currentRound);
      const ticketPda = getTicketPda(programId, roundPda, buyer);
      const newRoundPda = getRoundPda(programId, configPda, nextRound);
      const newRoundVaultPda = getRoundVaultPda(programId, configPda, nextRound);

      const tx = await program.methods
        .buyTicket(slotIndex)
        .accountsPartial({
          config: configPda,
          round: roundPda,
          roundVault: roundVaultPda,
          ticket: ticketPda,
          buyer,
          feeWallet: config.feeWallet,
          newRound: newRoundPda,
          newRoundVault: newRoundVaultPda,
        })
        .rpc();

      return tx as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round"] });
    },
  });
}
