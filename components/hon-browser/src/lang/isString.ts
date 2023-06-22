export default function isString (value: string | null | undefined): value is string {
  return typeof value === 'string' && value !== ''
}
