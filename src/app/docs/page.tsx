import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

export default async function DocsPage() {
  const files = await fs.readdir(path.join(process.cwd(), "src/docs"));

  const docs = await Promise.all(
    files
      .filter((filename) => filename.endsWith(".md"))
      .map(async (filename) => {
        const filePath = path.join(process.cwd(), "src/docs", filename);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const { data: frontMatter } = matter(fileContent);

        return {
          slug: filename.replace(".md", ""),
          frontMatter,
        };
      })
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">文档列表</h1>
      <div className="space-y-4">
        {docs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/${doc.slug}`}
            className="block p-4 border rounded hover:bg-gray-50"
          >
            <h2 className="text-xl font-semibold">{doc.frontMatter.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
