import { verifyMessage } from "viem";
import type { EIP1193Provider } from "viem";
import { request } from "./wallet";

export type StackProofPayload = {
  app: "StackProof";
  purpose: "Proof of Participation";
  version: "1.0";
  issuedAt: string; // ISO
  nonce: string;
  chainId: number;
  address: `0x${string}`;
};

export type StackProof = {
  payload: StackProofPayload;
  message: string;
  signature: `0x${string}`;
};

export function makeNonce(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildMessage(payload: StackProofPayload): string {
  // Mensaje legible
  return [
    "STACKPROOF",
    `app: ${payload.app}`,
    `purpose: ${payload.purpose}`,
    `version: ${payload.version}`,
    `address: ${payload.address}`,
    `chainId: ${payload.chainId}`,
    `issuedAt: ${payload.issuedAt}`,
    `nonce: ${payload.nonce}`,
  ].join("\n");
}

export async function signProof(
  provider: EIP1193Provider,
  address: `0x${string}`,
  chainId: number
): Promise<StackProof> {
  const payload: StackProofPayload = {
    app: "StackProof",
    purpose: "Proof of Participation",
    version: "1.0",
    issuedAt: new Date().toISOString(),
    nonce: makeNonce(),
    chainId,
    address,
  };

  const message = buildMessage(payload);

  const signature = await request<`0x${string}`>(provider, {
    method: "personal_sign",
    params: [message, address],
  });

  return { payload, message, signature };
}

export async function verifyProof(proof: StackProof): Promise<boolean> {
  return verifyMessage({
    address: proof.payload.address,
    message: proof.message,
    signature: proof.signature,
  });
}

export const STORAGE_KEY = "stackproof:lastProof";

export function saveProof(proof: StackProof): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proof));
}

export function loadProof(): StackProof | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StackProof;
  } catch {
    return null;
  }
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
