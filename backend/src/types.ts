export interface UserFromResponse {
  _id: string;
}

export interface MessageResponse {
  message: string;
}

export type Overwrite<
  T,
  U extends Partial<{
    [k in keyof T]: unknown;
  }>,
> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type OmitStrict<T, K extends keyof T> = T extends any
  ? Pick<T, Exclude<keyof T, K>>
  : never;

export enum UserRole {
  buyer = "buyer",
  seller = "seller",
  admin = "admin",
  public = "public",
}

export interface ResponseBody<Data> {
  error: string | null;
  data: Data;
}

export interface ApiType<Req, Res> {
  request: Req;
  response: Res;
}
