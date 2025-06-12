import { diffLines } from 'diff';

export function getFileDiff(oldContent: string, newContent: string) {
  return diffLines(oldContent, newContent);
}
