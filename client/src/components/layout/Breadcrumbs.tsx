import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="text-gray-500 hover:text-black">
              {item.label}
            </Link>
          ) : (
            <span className="text-black">{item.label}</span>
          )}
          {index < items.length - 1 && <span className="text-gray-300">/</span>}
        </div>
      ))}
    </nav>
  );
}
