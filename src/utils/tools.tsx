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

export const customTagParse = (tagStr: string) => {
  let r = {} as any;
  if (tagStr) {
    const actionList = tagStr.split(',');
    actionList.map((b) => {
      const [k, v] = b.split('=');
      r[k] = v;
    });
  }
  return r;
};
