export function clamp(text: string, max: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return normalized.slice(0, max) + '…';
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined') {
    const anyCrypto = crypto as any;
    if (typeof anyCrypto?.randomUUID === 'function') {
      return anyCrypto.randomUUID();
    }
    if (typeof anyCrypto?.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      anyCrypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
      return (
        hex.slice(0, 4).join('') + '-' +
        hex.slice(4, 6).join('') + '-' +
        hex.slice(6, 8).join('') + '-' +
        hex.slice(8, 10).join('') + '-' +
        hex.slice(10, 16).join('')
      );
    }
  }
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
  return (
    s4() + s4() + '-' +
    s4() + '-4' + s4().slice(0, 3) + '-' +
    ((8 + Math.floor(Math.random() * 4)).toString(16)) + s4().slice(0, 3) + '-' +
    s4() + s4() + s4()
  );
}

export function generateId(prefix?: string): string {
  const id = generateUUID();
  return prefix ? `${prefix}${id}` : id;
}


