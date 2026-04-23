declare module 'bcryptjs' {
  export function genSaltSync(rounds?: number): string;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSalt(rounds: number, callback: (err: Error, salt: string) => void): void;

  export function hashSync(s: string, salt?: string | number): string;
  export function hash(s: string, salt: string | number): Promise<string>;
  export function hash(s: string, salt: string, callback: (err: Error, hash: string) => void): void;
  export function hash(s: string, salt: number, callback: (err: Error, hash: string) => void): void;

  export function compareSync(s: string, hash: string): boolean;
  export function compare(s: string, hash: string): Promise<boolean>;
  export function compare(s: string, hash: string, callback: (err: Error, value: boolean) => void): void;

  export function hashSync(s: string, options: { rounds?: number; seed?: number }): string;
  export function hash(s: string, options: { rounds?: number; seed?: number }): Promise<string>;
  export function hash(s: string, options: { rounds?: number; seed?: number }, callback: (err: Error, hash: string) => void): void;

  export function getRounds(hash: string): number;
  export function getSalt(hash: string): string;
}
