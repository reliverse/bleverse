import { getLLMText, blogSource, loreSource, source } from "~/lib/source";

export const revalidate = false;

export async function GET() {
  const docsScan = source.getPages().map(getLLMText);
  const blogScan = blogSource.getPages().map(getLLMText);
  const loreScan = loreSource.getPages().map(getLLMText);
  const [docs, blog, lore] = await Promise.all([
    Promise.all(docsScan),
    Promise.all(blogScan),
    Promise.all(loreScan),
  ]);
  return new Response([...docs, ...blog, ...lore].join("\n\n"));
}
