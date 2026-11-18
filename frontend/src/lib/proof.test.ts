import { describe, expect, it } from "vitest";
import { privateKeyToAccount } from "viem/accounts";
import {
  SAMPLE_PROOF,
  buildMessage,
  makeNonce,
  parseProof,
  parseProofJson,
  verifyProof,
  type StackProof,
  type StackProofPayload,
} from "./proof";

const account = privateKeyToAccount(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
);

async function makeProof(overrides: Partial<StackProofPayload> = {}): Promise<StackProof> {
  const payload: StackProofPayload = {
    app: "StackProof",
    purpose: "Proof of Participation",
    version: "1.0",
    issuedAt: "2026-01-01T00:00:00.000Z",
    nonce: makeNonce(),
    chainId: 1,
    address: account.address,
    ...overrides,
  };
  const message = buildMessage(payload);
  const signature = await account.signMessage({ message });
  return { payload, message, signature };
}

describe("verifyProof", () => {
  it("accepts a proof signed by the payload address", async () => {
    expect(await verifyProof(await makeProof())).toEqual({ ok: true });
  });

  it("accepts the bundled sample proof", async () => {
    expect(await verifyProof(SAMPLE_PROOF)).toEqual({ ok: true });
  });

  it("rejects a payload edited after signing (message mismatch)", async () => {
    const proof = await makeProof();
    const edited = { ...proof, payload: { ...proof.payload, chainId: 137 } };
    const res = await verifyProof(edited);
    expect(res.ok).toBe(false);
  });

  it("rejects a valid signature claimed by another address", async () => {
    const proof = await makeProof();
    const other = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const;
    const payload = { ...proof.payload, address: other };
    const res = await verifyProof({ ...proof, payload, message: buildMessage(payload) });
    expect(res.ok).toBe(false);
  });

  it("rejects a tampered signature", async () => {
    const proof = await makeProof();
    const last = proof.signature.slice(-1) === "0" ? "1" : "0";
    const tampered = { ...proof, signature: `${proof.signature.slice(0, -1)}${last}` as `0x${string}` };
    let ok = true;
    try {
      ok = (await verifyProof(tampered)).ok;
    } catch {
      ok = false;
    }
    expect(ok).toBe(false);
  });
});

describe("parseProof", () => {
  it("round-trips a valid proof through JSON", async () => {
    const proof = await makeProof();
    expect(parseProofJson(JSON.stringify(proof))).toEqual(proof);
  });

  it.each([
    ["not an object", 42],
    ["null", null],
    ["missing payload", { message: "x", signature: "0x" }],
    ["bad signature length", { ...SAMPLE_PROOF, signature: "0x1234" }],
    ["bad address", { ...SAMPLE_PROOF, payload: { ...SAMPLE_PROOF.payload, address: "0x123" } }],
    ["bad date", { ...SAMPLE_PROOF, payload: { ...SAMPLE_PROOF.payload, issuedAt: "yesterday" } }],
    ["wrong app", { ...SAMPLE_PROOF, payload: { ...SAMPLE_PROOF.payload, app: "Other" } }],
  ])("rejects %s", (_name, input) => {
    expect(parseProof(input)).toBeNull();
  });

  it("returns null for invalid JSON text", () => {
    expect(parseProofJson("{ nope")).toBeNull();
  });
});

describe("makeNonce", () => {
  it("is hex of the requested length and not repeated", () => {
    const a = makeNonce();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(makeNonce()).not.toBe(a);
  });
});
