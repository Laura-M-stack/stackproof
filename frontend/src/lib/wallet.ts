import type { EIP1193Provider } from "viem";

export type WalletState =
  | { status: "disconnected" }
  | { status: "no-wallet" }
  | { status: "connected"; address: `0x${string}`; chainId: number };

export function getInjectedProvider(): EIP1193Provider | null {
  return typeof window !== "undefined" && window.ethereum ? window.ethereum : null;
}

type RequestArgs = { method: string; params?: unknown[] | object };

export async function request<T>(
  provider: EIP1193Provider,
  args: RequestArgs
): Promise<T> {
  const res = await provider.request(args as Parameters<EIP1193Provider["request"]>[0]);
  return res as T;
}

export async function connectWallet(): Promise<WalletState> {
  const provider = getInjectedProvider();
  if (!provider) return { status: "no-wallet" };

  const accounts = await request<string[]>(provider, { method: "eth_requestAccounts" });
  const address = accounts[0] as `0x${string}` | undefined;
  if (!address) return { status: "disconnected" };

  const chainHex = await request<string>(provider, { method: "eth_chainId" });
  const chainId = Number.parseInt(chainHex, 16);

  return { status: "connected", address, chainId };
}

export async function getWalletState(): Promise<WalletState> {
  const provider = getInjectedProvider();
  if (!provider) return { status: "no-wallet" };

  const accounts = await request<string[]>(provider, { method: "eth_accounts" });
  const address = accounts[0] as `0x${string}` | undefined;
  if (!address) return { status: "disconnected" };

  const chainHex = await request<string>(provider, { method: "eth_chainId" });
  const chainId = Number.parseInt(chainHex, 16);

  return { status: "connected", address, chainId };
}

export function shortenAddress(addr: `0x${string}`): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
