import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "es";

const en = {
  skip: "Skip to content",
  nav: { demo: "Demo", how: "How it works", tech: "Under the hood", faq: "FAQ", code: "Code", label: "Main" },
  lang: { label: "Language" },
  hero: {
    kicker: "Web3 · EIP-191 signatures",
    titleA: "Proof you took part.",
    titleB: "Signed by your wallet.",
    lead: "Sign a message and get a JSON certificate. Anyone can check it was you: no server, no gas, no account.",
    ctaPrimary: "Try the demo",
    ctaSecondary: "See how it works",
    points: ["No gas", "No server", "Works offline"],
    sampleTag: "Example",
  },
  cert: {
    title: "Certificate of participation",
    address: "Signer",
    chain: "Network",
    issued: "Issued",
    nonce: "Nonce",
    signature: "Signature",
    verified: "Signature valid",
    unchecked: "Not checked yet",
    invalid: "Signature invalid",
    sample: "Sample signed with a throwaway key",
  },
  demo: {
    kicker: "Live demo",
    title: "Create a proof, then check it",
    lead: "Step 1 needs a browser wallet such as MetaMask. Step 2 works for everyone: load the sample if you do not have one.",
    gen: { step: "Step 1", title: "Create your proof", sub: "Signing a message is free and cannot move your funds." },
    connect: "Connect with MetaMask",
    connected: "Connected: {address}",
    connectedHint: "{chain}",
    noWallet: "No wallet found in this browser. You can still check a proof in step 2.",
    needConnect: "Connect a wallet to continue.",
    previewTitle: "You are about to sign",
    previewNote: "The time and the random nonce are filled in when you sign.",
    previewTime: "<time of signing>",
    previewNonce: "<random nonce>",
    generate: "Sign and create proof",
    generating: "Waiting for your signature…",
    copy: "Copy JSON",
    download: "Download JSON",
    checkThis: "Check this proof",
    ver: { step: "Step 2", title: "Check any proof", sub: "Paste a StackProof JSON. No wallet needed." },
    pasteLabel: "Proof JSON",
    pastePlaceholder: '{ "payload": { … }, "message": "…", "signature": "0x…" }',
    sample: "Load sample proof",
    verify: "Check proof",
    tamper: "Break the signature",
    tamperHint: "Edit one character and see the check fail.",
  },
  msg: {
    signing: "Waiting for your signature…",
    verifying: "Checking…",
    copied: "JSON copied to the clipboard.",
    copyFail: "Could not copy. Use Download JSON instead.",
    rejected: "You rejected the request in your wallet.",
    pending: "A request is already open: check your wallet.",
    walletError: "The wallet returned an error. Please try again.",
    valid: "Valid: the signature belongs to the signer.",
    invalidMismatch: "Invalid: the text was edited after signing.",
    invalidSignature: "Invalid: the signature does not match the signer.",
    unreadable: "Invalid: the signature could not be read.",
    notProof: "That is not a StackProof JSON. Paste the whole file you exported.",
  },
  how: {
    kicker: "How it works",
    title: "Three steps, all in your browser",
    steps: [
      { t: "Sign", d: "Your wallet signs a readable message with your address, network, time and a random nonce." },
      { t: "Export", d: "You get a JSON with the message and the signature. Copy it, download it, send it." },
      { t: "Check", d: "Anyone recovers the signer from the signature and compares it with the address in the message." },
    ],
  },
  tech: {
    kicker: "Under the hood",
    title: "What is signed, and what is checked",
    lead: "The certificate is just a message and a signature. Nothing is hidden, so anyone can reproduce the check.",
    msgTitle: "The signed message",
    notes: [
      "Fixed header, so the signature cannot be reused for another app.",
      "The address that must have signed.",
      "The network where the wallet was connected.",
      "When the proof was created.",
      "Random value: two proofs are never the same.",
    ],
    checksTitle: "The two checks",
    checks: [
      "The message equals the one rebuilt from the readable fields, so nobody can edit them afterwards.",
      "The signature recovers to the address in the message (EIP-191, personal_sign).",
    ],
    limitsTitle: "Limits",
    limits: [
      "It proves control of a key at a moment in time, not who the person is.",
      "Nothing is stored on-chain, so there is no public record or revocation.",
      "Only regular wallets (EOA). Smart-contract wallets need an on-chain check (ERC-1271).",
    ],
  },
  faq: {
    kicker: "FAQ",
    title: "Questions people ask",
    items: [
      { q: "Does it cost gas?", a: "No. Signing a message is not a transaction. Nothing is sent to any network." },
      { q: "Can it move my funds?", a: "No. The wallet shows you the exact text before you sign, and that text is not a transaction." },
      { q: "Is anything stored?", a: "Only the last proof, in your own browser (localStorage). There is no server and no account." },
      { q: "Can I check a proof without a wallet?", a: "Yes. Step 2 runs locally and only needs the JSON." },
      { q: "Why does the repository have a smart contract?", a: "It is a separate experiment with an on-chain version of the idea. This page does not use it." },
    ],
  },
  footer: { made: "Portfolio demo by Laura Moyano", code: "Source code", top: "Back to top" },
};

export type Dict = typeof en;
export type MsgKey = keyof Dict["msg"];

const es: Dict = {
  skip: "Saltar al contenido",
  nav: { demo: "Demo", how: "Cómo funciona", tech: "Por dentro", faq: "Preguntas", code: "Código", label: "Principal" },
  lang: { label: "Idioma" },
  hero: {
    kicker: "Web3 · Firmas EIP-191",
    titleA: "La prueba de que participaste.",
    titleB: "Firmada por tu wallet.",
    lead: "Firma un mensaje y obtén un certificado en JSON. Cualquiera puede comprobar que fuiste tú: sin servidor, sin gas y sin cuentas.",
    ctaPrimary: "Probar la demo",
    ctaSecondary: "Ver cómo funciona",
    points: ["Sin gas", "Sin servidor", "Funciona sin conexión"],
    sampleTag: "Ejemplo",
  },
  cert: {
    title: "Certificado de participación",
    address: "Firmante",
    chain: "Red",
    issued: "Emitido",
    nonce: "Nonce",
    signature: "Firma",
    verified: "Firma válida",
    unchecked: "Sin comprobar",
    invalid: "Firma inválida",
    sample: "Ejemplo firmado con una clave descartable",
  },
  demo: {
    kicker: "Demo en vivo",
    title: "Crea una prueba y compruébala",
    lead: "El paso 1 necesita una wallet de navegador como MetaMask. El paso 2 funciona para todos: carga el ejemplo si no tienes una.",
    gen: { step: "Paso 1", title: "Crea tu prueba", sub: "Firmar un mensaje es gratis y no puede mover tus fondos." },
    connect: "Conectar con MetaMask",
    connected: "Conectada: {address}",
    connectedHint: "{chain}",
    noWallet: "No hay una wallet en este navegador. Igual puedes comprobar una prueba en el paso 2.",
    needConnect: "Conecta una wallet para continuar.",
    previewTitle: "Estás por firmar",
    previewNote: "La hora y el nonce aleatorio se completan al firmar.",
    previewTime: "<hora de la firma>",
    previewNonce: "<nonce aleatorio>",
    generate: "Firmar y crear prueba",
    generating: "Esperando tu firma…",
    copy: "Copiar JSON",
    download: "Descargar JSON",
    checkThis: "Comprobar esta prueba",
    ver: { step: "Paso 2", title: "Comprueba cualquier prueba", sub: "Pega un JSON de StackProof. No necesitas wallet." },
    pasteLabel: "JSON de la prueba",
    pastePlaceholder: '{ "payload": { … }, "message": "…", "signature": "0x…" }',
    sample: "Cargar prueba de ejemplo",
    verify: "Comprobar prueba",
    tamper: "Romper la firma",
    tamperHint: "Cambia un carácter y mira cómo falla la comprobación.",
  },
  msg: {
    signing: "Esperando tu firma…",
    verifying: "Comprobando…",
    copied: "JSON copiado al portapapeles.",
    copyFail: "No se pudo copiar. Usa Descargar JSON.",
    rejected: "Rechazaste la solicitud en tu wallet.",
    pending: "Ya hay una solicitud abierta: revisa tu wallet.",
    walletError: "La wallet devolvió un error. Inténtalo de nuevo.",
    valid: "Válida: la firma pertenece al firmante.",
    invalidMismatch: "Inválida: el texto se editó después de firmar.",
    invalidSignature: "Inválida: la firma no coincide con el firmante.",
    unreadable: "Inválida: no se pudo leer la firma.",
    notProof: "Eso no es un JSON de StackProof. Pega el archivo completo que exportaste.",
  },
  how: {
    kicker: "Cómo funciona",
    title: "Tres pasos, todo en tu navegador",
    steps: [
      { t: "Firma", d: "Tu wallet firma un mensaje legible con tu dirección, la red, la hora y un nonce aleatorio." },
      { t: "Exporta", d: "Obtienes un JSON con el mensaje y la firma. Cópialo, descárgalo o envíalo." },
      { t: "Comprueba", d: "Cualquiera recupera al firmante desde la firma y lo compara con la dirección del mensaje." },
    ],
  },
  tech: {
    kicker: "Por dentro",
    title: "Qué se firma y qué se comprueba",
    lead: "El certificado es solo un mensaje y una firma. No hay nada oculto, así que cualquiera puede repetir la comprobación.",
    msgTitle: "El mensaje firmado",
    notes: [
      "Encabezado fijo: la firma no sirve para otra app.",
      "La dirección que debe haber firmado.",
      "La red en la que estaba conectada la wallet.",
      "Cuándo se creó la prueba.",
      "Valor aleatorio: dos pruebas nunca son iguales.",
    ],
    checksTitle: "Las dos comprobaciones",
    checks: [
      "El mensaje es igual al reconstruido con los campos legibles, así nadie puede editarlos después.",
      "La firma recupera la dirección que figura en el mensaje (EIP-191, personal_sign).",
    ],
    limitsTitle: "Límites",
    limits: [
      "Prueba el control de una clave en un momento dado, no quién es la persona.",
      "No se guarda nada en la cadena: no hay registro público ni revocación.",
      "Solo wallets comunes (EOA). Las wallets de contrato necesitan una comprobación on-chain (ERC-1271).",
    ],
  },
  faq: {
    kicker: "Preguntas",
    title: "Lo que suele preguntarse",
    items: [
      { q: "¿Cuesta gas?", a: "No. Firmar un mensaje no es una transacción. No se envía nada a ninguna red." },
      { q: "¿Puede mover mis fondos?", a: "No. La wallet te muestra el texto exacto antes de firmar, y ese texto no es una transacción." },
      { q: "¿Se guarda algo?", a: "Solo la última prueba, en tu propio navegador (localStorage). No hay servidor ni cuentas." },
      { q: "¿Puedo comprobar una prueba sin wallet?", a: "Sí. El paso 2 se ejecuta en local y solo necesita el JSON." },
      { q: "¿Por qué el repositorio tiene un contrato?", a: "Es un experimento aparte con una versión on-chain de la idea. Esta página no lo usa." },
    ],
  },
  footer: { made: "Demo de portfolio de Laura Moyano", code: "Código fuente", top: "Volver arriba" },
};

const DICTS: Record<Lang, Dict> = { en, es };
const KEY = "stackproof:lang";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "es") return saved;
  } catch {
    // ignore
  }
  return typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const I18nContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: DICTS[lang] }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside LangProvider");
  return ctx;
}

export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}
