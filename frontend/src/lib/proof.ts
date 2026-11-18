import { isAddress, toHex, verifyMessage } from "viem";
import type { EIP1193Provider } from "viem";
import { request } from "./wallet";

export type StackProofPayload = {
  app: "StackProof";
  purpose: "Proof of Participation";
  version: "1.0";
  issuedAt: string; // ISO 8601
  nonce: string;
  chainId: number;
  address: `0x${string}`;
};

export type StackProof = {
  payload: StackProofPayload;
  message: string;
  signature: `0x${string}`;
};

export type VerifyResult = { ok: true } | { ok: false; reason: "mismatch" | "signature" };

export function makeNonce(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildMessage(payload: StackProofPayload): string {
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
    params: [toHex(message), address],
  });

  return { payload, message, signature };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Validates the shape of untrusted data (localStorage, pasted JSON). Returns null if invalid. */
export function parseProof(input: unknown): StackProof | null {
  if (!isRecord(input) || !isRecord(input.payload)) return null;
  const p = input.payload;

  if (p.app !== "StackProof" || p.purpose !== "Proof of Participation" || p.version !== "1.0") {
    return null;
  }
  if (typeof p.issuedAt !== "string" || Number.isNaN(Date.parse(p.issuedAt))) return null;
  if (typeof p.nonce !== "string" || p.nonce.length === 0) return null;
  if (typeof p.chainId !== "number" || !Number.isInteger(p.chainId) || p.chainId < 1) return null;
  if (typeof p.address !== "string" || !isAddress(p.address, { strict: false })) return null;
  if (typeof input.message !== "string") return null;
  if (typeof input.signature !== "string" || !/^0x[0-9a-fA-F]{130}$/.test(input.signature)) {
    return null;
  }

  return {
    payload: {
      app: "StackProof",
      purpose: "Proof of Participation",
      version: "1.0",
      issuedAt: p.issuedAt,
      nonce: p.nonce,
      chainId: p.chainId,
      address: p.address as `0x${string}`,
    },
    message: input.message,
    signature: input.signature as `0x${string}`,
  };
}

export function parseProofJson(raw: string): StackProof | null {
  try {
    return parseProof(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Checks two things: the signed message is exactly the one the payload describes
 * (so the readable fields cannot be edited), and the signature belongs to payload.address.
 */
export async function verifyProof(proof: StackProof): Promise<VerifyResult> {
  if (proof.message !== buildMessage(proof.payload)) {
    return { ok: false, reason: "mismatch" };
  }
  const ok = await verifyMessage({
    address: proof.payload.address,
    message: proof.message,
    signature: proof.signature,
  });
  return ok ? { ok: true } : { ok: false, reason: "signature" };
}

/** Pre-signed with a throwaway key so anyone can try verification without a wallet. */
export const SAMPLE_PROOF: StackProof = {
  "payload": {
    "app": "StackProof",
    "purpose": "Proof of Participation",
    "version": "1.0",
    "issuedAt": "2026-11-18T12:00:00.000Z",
    "nonce": "5f2a9c4e71b38d0a6c1e94b7d2f08a33",
    "chainId": 1,
    "address": "0x0ba35016445712158fc6d03670705ec219ccec80"
  },
  "message": "STACKPROOF\napp: StackProof\npurpose: Proof of Participation\nversion: 1.0\naddress: 0x0ba35016445712158fc6d03670705ec219ccec80\nchainId: 1\nissuedAt: 2026-11-18T12:00:00.000Z\nnonce: 5f2a9c4e71b38d0a6c1e94b7d2f08a33",
  "signature": "0x34c3b1e15e2354d52fe21ca1864bda8e319cefdc1d0e792094a08bfd7734047b3074d991a8cd584163ca4c90e13bb8126cc68121ed71862cea166e5b1237eec91c"
};

export const STORAGE_KEY = "stackproof:lastProof";

export function saveProof(proof: StackProof): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proof));
  } catch {
    // Private mode or full storage: the proof still works in memory.
  }
}

export function loadProof(): StackProof | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseProofJson(raw) : null;
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
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
