import escrowArtifact from "../../artifacts/contracts/Payement.sol/Escrow.json";

// Generated by Hardhat compilation. Ensure `npx hardhat compile` has been run so the artifact exists.

interface EscrowArtifact {
  abi: any[];
  bytecode: `0x${string}`;
}

const typedArtifact = escrowArtifact as EscrowArtifact;

export const ESCROW_ABI = typedArtifact.abi;
export const ESCROW_BYTECODE = typedArtifact.bytecode;
