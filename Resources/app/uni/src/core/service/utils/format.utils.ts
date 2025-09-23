import MD5 from 'md5-es';
/**
 * Generates a md5 hash of the given value.
 *
 * @param {String} value
 * @return {String}
 */
// eslint-disable-next-line sw-deprecation-rules/private-feature-declarations
export function md5(value: string): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  return MD5.hash(value) as string;
}
