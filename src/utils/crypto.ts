/**
 * Base64 Obfuscation helper for localStorage keys
 */
export function obfuscateKey(key: string): string {
  if (!key) return "";
  try {
    // Basic XOR obfuscation combined with base64 to prevent easy reading
    const code = "mycanvaslab-salt-key-2026";
    const xor = key.split("").map((char, i) => {
      const charCode = char.charCodeAt(0) ^ code.charCodeAt(i % code.length);
      return String.fromCharCode(charCode);
    }).join("");
    return btoa(unescape(encodeURIComponent(xor)));
  } catch (e) {
    return btoa(key);
  }
}

export function deobfuscateKey(obfuscated: string): string {
  if (!obfuscated) return "";
  try {
    const rawXor = decodeURIComponent(escape(atob(obfuscated)));
    const code = "mycanvaslab-salt-key-2026";
    return rawXor.split("").map((char, i) => {
      const charCode = char.charCodeAt(0) ^ code.charCodeAt(i % code.length);
      return String.fromCharCode(charCode);
    }).join("");
  } catch (e) {
    try {
      return atob(obfuscated);
    } catch {
      return obfuscated;
    }
  }
}

/**
 * Generate a quick hash/checksum for a virtual file's content
 */
export function generateChecksum(content: string): string {
  let hash = 0;
  if (content.length === 0) return "0";
  for (let i = 0; i < content.length; i++) {
    const chr = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Generate unique random IDs
 */
export function generateUUID(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
