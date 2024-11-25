import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { remark } from "remark";
import { visit } from "unist-util-visit";
// import TableOfContents from "./components/TableOfContents";
// 辅助函数：生成一致的 ID
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-") // 替换空格为连字符
    .replace(/[^a-z0-9-]/g, "") // 移除特殊字符
    .replace(/-+/g, "-") // 替换多个连字符为单个
    .replace(/^-|-$/g, ""); // 移除首尾连字符
}

// 解析 Markdown 获取目录
async function getTableOfContents(content: string) {
  const headings: { level: number; text: string; id: string }[] = [];

  const tree = await remark().parse(content);

  visit(tree, "heading", (node) => {
    const text = node.children
      .filter((child) => child.type === "text")
      .map((child) => child.value)
      .join("");

    const id = generateId(text);

    headings.push({
      level: node.depth,
      text,
      id,
    });
  });
  console.log("headings", headings);

  return headings;
}

// 获取文档内容的函数
async function getDocContent(slug: string) {
  try {
    const filePath = path.join(process.cwd(), "src/docs", `${slug}.md`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    return {
      ...matter(fileContent),
      toc: await getTableOfContents(fileContent),
    };
  } catch (error) {
    console.error(`Error reading file ${slug}.md:`, error);
    return null;
  }
}

// 生成静态路径
export async function generateStaticParams() {
  const files = await fs.readdir(path.join(process.cwd(), "src/docs"));

  return files
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => ({
      slug: filename.replace(".md", ""),
    }));
}

// DocContent 组件
async function DocContent({ slug }: { slug: string }) {
  const doc = await getDocContent(slug);

  if (!doc) {
    notFound();
  }

  const { data: frontMatter, content, toc } = doc;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 左侧导航 */}
      {/* <nav className="w-64 border-r border-gray-200 bg-white p-4 h-screen sticky top-0">
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">目录</h2>
          <TableOfContents toc={toc} />
        </div>
      </nav> */}

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <article className="max-w-4xl mx-auto px-8 py-12">
          {/* 文档标题 */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              {frontMatter.title}
            </h1>
            {frontMatter.description && (
              <p className="mt-2 text-xl text-gray-600">
                {frontMatter.description}
              </p>
            )}
          </header>

          {/* Markdown 内容 */}
          <div className="prose prose-lg prose-blue max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-800 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                code: ({ node, inline, className, children, ...props }) => (
                  <code
                    className={`${className} ${
                      inline ? "bg-gray-100 rounded px-1" : ""
                    }`}
                    {...props}
                  >
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
                    {children}
                  </pre>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}

// 主页面组件
export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<div>加载中...</div>}>
      <DocContent slug={resolvedParams.slug} />
    </Suspense>
  );
}
