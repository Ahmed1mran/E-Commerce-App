import { compareSync, hashSync } from 'bcrypt';

export const generateHash = (
  plaintext: string,
  salt = process.env.SALT || '8',
): string => {
  return hashSync(plaintext, parseInt(salt));
};

export const compareHash = (plaintext: string, hashValue: string): boolean => {
  return compareSync(plaintext, hashValue);
};
