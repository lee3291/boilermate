const KEY = 'saved-cache-v1';

type MapShape = Record<string, true>; // key: `${username}:${listingId}`

function read(): MapShape {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as MapShape; } catch { return {}; }
}
function write(m: MapShape) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {} }

export function getSavedHint(username: string | undefined, listingId: string) {
  if (!username) return undefined;
  const m = read();
  return m[`${username}:${listingId}`] ? true : undefined; // undefined = unknown
}

export function setSavedHint(username: string, listingId: string, isSaved: boolean) {
  const m = read();
  const k = `${username}:${listingId}`;
  if (isSaved) m[k] = true;
  else delete m[k];
  write(m);
}
