import { app, safeStorage } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const SECRETS_FILE = 'secrets.bin';

function secretsPath() {
  return path.join(app.getPath('userData'), SECRETS_FILE);
}

type Secrets = {
  openaiKey?: string;
};

function readAll(): Secrets {
  const p = secretsPath();
  if (!fs.existsSync(p)) return {};
  try {
    const encrypted = fs.readFileSync(p);
    if (!safeStorage.isEncryptionAvailable()) return {};
    const json = safeStorage.decryptString(encrypted);
    return JSON.parse(json) as Secrets;
  } catch {
    return {};
  }
}

function writeAll(secrets: Secrets) {
  const p = secretsPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('OS keychain encryption unavailable');
  }
  const encrypted = safeStorage.encryptString(JSON.stringify(secrets));
  fs.writeFileSync(p, encrypted);
}

export const storage = {
  getOpenAIKey(): string | null {
    return readAll().openaiKey ?? null;
  },
  setOpenAIKey(key: string) {
    const all = readAll();
    all.openaiKey = key;
    writeAll(all);
  },
  clearOpenAIKey() {
    const all = readAll();
    delete all.openaiKey;
    writeAll(all);
  },
  hasOpenAIKey(): boolean {
    return Boolean(readAll().openaiKey);
  },
};
