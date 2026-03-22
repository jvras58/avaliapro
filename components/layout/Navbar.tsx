"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { href: "/questions", label: "Questions" },
  { href: "/exams", label: "Exams" },
  { href: "/grading", label: "Grading" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 flex items-center gap-6 h-14">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          AvaliaPro
        </Link>
        <Separator orientation="vertical" className="h-6" />
        <nav className="flex items-center gap-4">
          {navLinks.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
