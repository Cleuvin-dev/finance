export function authReturnPath(value: string | null) {
  return value === '/nova-senha' ? '/nova-senha' : '/';
}
