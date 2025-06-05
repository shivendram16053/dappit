import { useMemo } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from "../idl/dappit.json";

export const programId = new PublicKey("3PowFT1sQGcwNM1MtAkVaWRgpHru5xKeQezYTPBrDCPk");

export const useAnchor = () => {
  const wallet = useWallet();

  const connection = useMemo(() => {
    return new Connection("https://api.devnet.solana.com", "confirmed");
  }, []);

  const provider = useMemo(() => {
    if (!wallet?.publicKey || !wallet?.signTransaction) return null;
    return new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
  }, [wallet, connection]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(idl as Idl, provider);
  }, [provider]);

  return { connection, provider, program };
};
