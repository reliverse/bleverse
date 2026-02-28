import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { baseOptions } from "~/lib/layout.shared";
import { loreSource } from "~/lib/source";

export default function Layout({ children }: LayoutProps<"/lore">) {
  return (
    <DocsLayout tree={loreSource.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
