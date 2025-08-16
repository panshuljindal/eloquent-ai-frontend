export const API_BASE_URL: string = process.env.REACT_APP_API_BASE ?? 'http://3.138.86.235:5000';

export const CHAT_API_BASE: string = `${API_BASE_URL}/api/chat`;
export const AUTH_API_BASE: string = `${API_BASE_URL}/api/auth`;