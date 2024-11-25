"use client";

interface TOCProps {
  toc: Array<{
    level: number;
    text: string;
    id: string;
  }>;
}

export default function TableOfContents({ toc }: TOCProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    console.log("handleClick", id);
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <ul className="space-y-2">
      {toc.map((heading, index) => (
        <li
          key={index}
          style={{
            paddingLeft: `${(heading.level - 1) * 16}px`,
            fontSize: `${Math.max(16 - heading.level, 12)}px`,
          }}
        >
          <a
            href={`#${heading.id}`}
            onClick={(e) => handleClick(e, heading.id)}
            className={`
              block py-1 hover:text-blue-600 transition-colors
              ${heading.level === 1 ? "font-semibold" : "text-gray-600"}
            `}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
