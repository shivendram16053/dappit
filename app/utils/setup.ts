import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Dappit } from "@/idl/dappit";
import idl from "@/idl/dappit.json";


export function useProgram(): {
  program: Program<Dappit> | null;
  provider: AnchorProvider | null;
} {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  if (!wallet) return { program: null, provider: null };

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const program = new Program<Dappit>(idl as Dappit, provider);

  return { program, provider };
}
