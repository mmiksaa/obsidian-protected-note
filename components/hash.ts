import { SHA256, enc } from "crypto-js";

export const hash = (password: string) => SHA256(password).toString(enc.Hex);
