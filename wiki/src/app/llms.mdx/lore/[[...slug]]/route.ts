import { notFound } from "next/navigation";

import { getLLMText, loreSource } from "~/lib/source";

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<"/llms.mdx/lore/[[...slug]]">) {
  const { slug } = await params;
  const page = loreSource.getPage(slug);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

export function generateStaticParams() {
  return loreSource.generateParams();
}
