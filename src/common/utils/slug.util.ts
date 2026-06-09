import slugify from 'slugify';

export function generateBaseSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
}
