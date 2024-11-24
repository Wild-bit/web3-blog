import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const files = await fs.readdir(path.join(process.cwd(), "src/docs"));

  return files
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => ({
      slug: filename.replace(".md", ""),
    }));
}

async function getDocContent(slug: string) {
  try {
    const filePath = path.join(process.cwd(), "src/docs", `${slug}.md`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    return matter(fileContent);
  } catch (error) {
    return null;
  }
}

async function DocContent({ slug }: { slug: string }) {
  const doc = await getDocContent(slug);

  if (!doc) {
    notFound();
  }

  const { data: frontMatter, content } = doc;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{frontMatter.title}</h1>
      <div className="prose prose-lg">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </article>
  );
}

export default async function DocPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<div>加载中...</div>}>
      <DocContent slug={resolvedParams.slug} />
    </Suspense>
  );
}
