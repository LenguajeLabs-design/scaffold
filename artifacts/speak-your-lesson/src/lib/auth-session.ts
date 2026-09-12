// Google ID tokens stay in memory and expire with the provider token.
// UI role state is only a display hint; the server verifies every request.
let credential: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
export function getCredential() { return credential; }
export function clearCredential() {
  credential = null;
  clearTimeout(timer);
  window.dispatchEvent(new Event("scaffold-signout"));
}
export function setCredential(token: string) {
  const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  const expiresIn = payload.exp * 1000 - Date.now();
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) throw new Error("Expired credential");
  clearTimeout(timer);
  credential = token;
  timer = setTimeout(clearCredential, expiresIn);
}
