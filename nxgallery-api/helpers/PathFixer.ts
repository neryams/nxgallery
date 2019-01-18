import { join } from 'path';

export const BASE_DIR = join(__dirname, '..', '..');
export function getAbsolutePath(path: string): string {
  if (path.substr(0,1) === '~') {
    return path.replace('~', BASE_DIR);
  } else {
    return join(process.cwd(), path);
  }
}