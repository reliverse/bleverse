"use client";

import { useEffect, useState } from "react";
import { cn } from "./lib/utils";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function ProjectTableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3");
    const items: TOCItem[] = Array.from(elements).map((element) => {
      const text = element.textContent?.trim() || "";
      const levelText = element.tagName.slice(1);
      const levelValue = Number.parseInt(levelText || "2", 10);

      return {
        id: element.id || text.toLowerCase().replace(/\s+/g, "-") || "",
        text,
        level: Number.isNaN(levelValue) ? 2 : levelValue,
      };
    });

    // Add IDs to headings that don't have them
    elements.forEach((el, index) => {
      if (el.id) return;

      const item = items[index];

      if (item?.id) {
        el.id = item.id;
      }
    });

    setHeadings(items);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -80% 0px",
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden xl:block">
      <h4 className="mb-4 font-semibold text-sm">On This Page</h4>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            className={cn(heading.level === 3 && "ml-4", heading.level === 4 && "ml-8")}
            key={heading.id}
          >
            <a
              className={cn(
                "block transition-colors hover:text-foreground",
                activeId === heading.id ? "font-medium text-accent" : "text-muted-foreground"
              )}
              href={`#${heading.id}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
