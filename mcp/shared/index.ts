export function getBasicAuth(email: string, token: string): string {
  return Buffer.from(`${email}:${token}`).toString("base64");
}

export function log(server: string, message: string): void {
  console.error(`[${server}] ${message}`);
}
