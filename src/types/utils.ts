export type StrictOmit<T, K extends keyof T> = { [k in keyof T as k extends K ? never : k]: T[k] };

type Digit = Union<'0123456789'>;

type Special = Lowercase<string> & Uppercase<string>;

type Union<T extends string> = T extends `${infer Head}${infer Tail}` ? Head | Union<Tail> : never;

type IsDigit<T extends string> = T extends `${infer Head}${infer Tail}`
  ? Head extends Digit
    ? IsDigit<Tail>
    : false
  : true;

type IsAlphabet<T extends string> = T extends `${infer Head}${infer Tail}`
  ? Head extends Special
    ? false
    : IsAlphabet<Tail>
  : true;

type IsAlphanumeric<T extends string> = T extends `${infer Head}${infer Tail}`
  ? IsDigit<Head> extends true
    ? IsAlphanumeric<Tail>
    : IsAlphabet<Head> extends true
      ? IsAlphanumeric<Tail>
      : false
  : true;

export type Alphanumeric<T extends string> = T extends `${infer Head}${infer Tail}`
  ? IsAlphanumeric<Head> extends true
    ? `${Head}${Alphanumeric<Tail>}`
    : Alphanumeric<Tail>
  : '';
