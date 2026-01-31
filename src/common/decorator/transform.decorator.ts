import { Transform, TransformFnParams } from 'class-transformer';

export const TransformBigintToString = () => {
  return Transform(({ value }: TransformFnParams): string => {
    return typeof value === 'bigint' ? value.toString() : value;
  });
};

export const TransformStringToBigint = () => {
  return Transform(({ value }: TransformFnParams): bigint => {
    return typeof value === 'string' ? BigInt(value) : value;
  });
};
