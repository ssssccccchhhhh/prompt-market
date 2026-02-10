export function getBasicAuthHeader(email: string, token: string): Record<string, string> {
  const encoded = Buffer.from(`${email}:${token}`).toString("base64");
  return { Authorization: `Basic ${encoded}` };
}

export function getPrivateTokenHeader(token: string): Record<string, string> {
  return { "PRIVATE-TOKEN": token };
}

export function getBearerHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
