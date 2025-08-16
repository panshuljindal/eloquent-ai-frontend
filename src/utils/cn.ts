export function cn(...classNameParts: Array<string | false | null | undefined>): string {
  return classNameParts.filter(Boolean).join(' ');
}

export default cn;


