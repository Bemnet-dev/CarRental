import { User } from '@/types';
import { read, write, KEYS } from './storage';

export function getSession() {
  if (typeof window === 'undefined') return null;
  return read<any>(KEYS.SESSION, null);
}

export function signIn(email: string, password: string) {
  const users = read<User[]>(KEYS.USERS, []);
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { success: false, message: 'Invalid credentials' };
  if (user.status === 'suspended') return { success: false, message: 'Account suspended' };
  const session = { userId: user.id, email: user.email, role: user.role, roles: user.roles, firstName: user.firstName, lastName: user.lastName };
  write(KEYS.SESSION, session);
  return { success: true, session };
}

export function signUp(data: any) {
  const users = read<User[]>(KEYS.USERS, []);
  if (users.find(u => u.email === data.email)) return { success: false, message: 'Email exists' };
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || 'renter',
    roles: [data.role || 'renter'],
    phone: data.phone,
    status: 'active',
    createdAt: new Date().toISOString(),
    neighbourhood: data.neighbourhood
  };
  users.push(newUser);
  write(KEYS.USERS, users);
  return { success: true };
}

export function signOut() {
  if (typeof window !== 'undefined') localStorage.removeItem(KEYS.SESSION);
}

export function safeReturn(url: string | null) {
  if (!url || !url.startsWith('/')) return '/';
  return url;
}
