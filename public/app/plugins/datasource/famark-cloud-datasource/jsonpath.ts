import { JSONPath, JSONPathOptions } from 'jsonpath-plus';

export function jp(options: JSONPathOptions): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return JSONPath({ ...options } as any);
}
