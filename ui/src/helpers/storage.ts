export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem(key, defaultValue = null) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}
