export const objectToData = (data: object, prefix: string, limit?: string) => {
  if (!limit) {
    limit = '__';
  }
  const result = {} as any;
  for (const [key, value] of Object.entries(data)) {
    result[prefix + limit + key] = value;
  }
  return result;
};
