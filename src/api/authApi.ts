type AuthResponse = { data?: { user_id?: string | number; user?: { id?: string | number; name?: string }; message?: string }; user_id?: string | number; user?: { id?: string | number; name?: string }; message?: string };

const API_BASE = 'http://localhost:8000/api/auth';

function extractUser(json: AuthResponse): { id?: string; name?: string } {
  const idRaw = json?.data?.user?.id ?? json?.data?.user_id ?? json?.user?.id ?? json?.user_id;
  const name = json?.data?.user?.name ?? json?.user?.name;
  const id = idRaw !== undefined && idRaw !== null ? String(idRaw) : undefined;
  return { id, name };
}

function extractMessage(json: any, fallback: string): string {
  return json?.data?.message ?? json?.message ?? fallback;
}

export async function meApi(): Promise<{ userId: string; name?: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    let json: AuthResponse | undefined;
    try { json = (await res.json()) as AuthResponse; } catch {}
    if (!res.ok) return null;
    const { id, name } = json ? extractUser(json) : { id: undefined, name: undefined };
    if (!id) return null;
    return { userId: id, name };
  } catch {
    return null;
  }
}

export async function signupApi(payload: { email: string; password: string; name?: string }): Promise<{ userId: string; name?: string }> {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let json: AuthResponse | undefined;
  try {
    json = (await res.json()) as AuthResponse;
  } catch {}
  if (!res.ok) {
    const msg = extractMessage(json, 'Signup failed');
    throw new Error(msg);
  }
  const { id, name } = json ? extractUser(json) : { id: undefined, name: undefined };
  if (!id) throw new Error('Invalid signup response');
  return { userId: id, name };
}

export async function loginApi(payload: { email: string; password: string }): Promise<{ userId: string; name?: string }> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let json: AuthResponse | undefined;
  try {
    json = (await res.json()) as AuthResponse;
  } catch {}
  if (!res.ok) {
    const msg = extractMessage(json, 'Login failed');
    throw new Error(msg);
  }
  const { id, name } = json ? extractUser(json) : { id: undefined, name: undefined };
  if (!id) throw new Error('Invalid login response');
  return { userId: id, name };
}
