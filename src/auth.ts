import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "@aws-amplify/auth";
import { COGNITO_DOMAIN, COGNITO_CLIENT_ID, REDIRECT_URI } from "./awsConfig";

export interface UserInfo {
  username: string;
  attributes: Record<string, string>;
}

export async function loginWithHostedUI(): Promise<void> {
  // Sử dụng helper signInWithRedirect từ package
  await signInWithRedirect();
}

export async function getCurrentSession() {
  return fetchAuthSession();
}

export async function getIdToken(): Promise<string> {
  const session: any = await fetchAuthSession();

  // Try several shapes that Amplify/core might return
  const tokens: any = session?.tokens ?? session;

  let idTokenStr: string | undefined;

  if (!tokens) {
    throw new Error("Không tìm thấy idToken trong session");
  }

  if (typeof tokens === "string") {
    idTokenStr = tokens;
  } else if (tokens.idToken) {
    idTokenStr = tokens.idToken?.jwtToken ?? tokens.idToken?.getJwtToken?.() ?? tokens.idToken?.toString?.();
  } else if (tokens.getIdToken) {
    const idt = tokens.getIdToken();
    idTokenStr = idt?.jwtToken ?? idt?.getJwtToken?.() ?? idt?.toString?.();
  }

  if (!idTokenStr) {
    throw new Error("Không tìm thấy idToken trong session (không xác định được trường)");
  }

  return idTokenStr;
}

export async function getCurrentUserInfo(): Promise<UserInfo> {
  const user: any = await getCurrentUser();

  const username = (user?.username ?? user?.getUsername?.() ?? "") as string;

  const rawAttrs = user?.attributes ?? {};
  const attrs: Record<string, string> = {};
  Object.entries(rawAttrs).forEach(([k, v]) => {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      attrs[k] = String(v);
    }
  });

  if (Object.keys(attrs).length === 0) {
    try {
      const session: any = await fetchAuthSession();
      const idToken = session?.tokens?.idToken ?? session?.idToken ?? null;
      const payload = (idToken as any)?.payload ?? {};
      Object.entries(payload).forEach(([k, v]) => {
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
          attrs[k] = String(v);
        }
      });
    } catch (e) {
      // ignore
    }
  }

  return { username, attributes: attrs };
}

export async function logout(): Promise<void> {
  await signOut({ global: true });
}
