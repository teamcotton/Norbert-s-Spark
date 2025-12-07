import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';
import { readFileSync } from 'node:fs'
import path from 'node:path'

const tokeniseOpenAI = (file: string) => {

  const tokenizer = new Tiktoken(
    o200k_base,
  );

  const tokenize = (text: string) => {
    return tokenizer.encode(text);
  };

  const input = readFileSync(
    path.join(import.meta.dirname, file),
    'utf-8',
  );

  return tokenize(input);
}

export { tokeniseOpenAI }