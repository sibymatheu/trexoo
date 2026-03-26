import { BN } from "@coral-xyz/anchor";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useProgram } from "./useProgram";
import { getConfigPda, getRoundPda, getRoundVaultPda, getClaimRecordPda } from "./pda";

export function useClaimPrize() {
  const { program } = useProgram();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roundNumber?: BN) => {
      if (!program) throw new Error("Wallet not connected");

      const programId = program.programId;
      const claimer = program.provider.publicKey!;

      const configPda = getConfigPda(programId);
      const config = await program.account.lotteryConfig.fetch(configPda);
      const targetRound = (roundNumber ?? config.currentRound) as unknown as BN;

      const roundPda = getRoundPda(programId, configPda, targetRound);
      const roundVaultPda = getRoundVaultPda(programId, configPda, targetRound);
      const claimRecordPda = getClaimRecordPda(programId, roundPda, claimer);

      const tx = await program.methods
        .claimPrize()
        .accountsPartial({
          config: configPda,
          round: roundPda,
          roundVault: roundVaultPda,
          claimRecord: claimRecordPda,
          claimer,
        })
        .rpc();

      return tx as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round"] });
    },
  });
}
