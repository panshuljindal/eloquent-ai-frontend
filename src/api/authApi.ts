import { AUTH_API_BASE as API_BASE } from 'config/env';
type AuthResponse = { data?: { access_token?: string; user_id?: string | number; user?: { id?: string | number; name?: string }; message?: string }; user_id?: string | number; user?: { id?: string | number; name?: string }; message?: string };

function extractUser(json: AuthResponse): { id?: string; name?: string; token?: string } {
  const idRaw = json?.data?.user?.id ?? json?.data?.user_id ?? json?.user?.id ?? json?.user_id;
  const name = json?.data?.user?.name ?? json?.user?.name;
  const id = idRaw !== undefined && idRaw !== null ? String(idRaw) : undefined;
  const token = json?.data?.access_token ?? undefined;
  return { id, name, token };
}

function extractMessage(json: any, fallback: string): string {
  return json?.data?.message ?? json?.message ?? fallback;
}

export async function signupApi(payload: { email: string; password: string; name?: string }): Promise<{ userId: string; name?: string; token?: string }> {
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
  const { id, name, token } = json ? extractUser(json) : { id: undefined, name: undefined, token: undefined };
  if (!id) throw new Error('Invalid signup response');
  return { userId: id, name, token };
}

export async function loginApi(payload: { email: string; password: string }): Promise<{ userId: string; name?: string; token?: string }> {
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
  const { id, name, token } = json ? extractUser(json) : { id: undefined, name: undefined, token: undefined };
  if (!id) throw new Error('Invalid login response');
  return { userId: id, name, token };
}
