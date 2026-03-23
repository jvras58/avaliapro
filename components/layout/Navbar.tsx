"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/questions", label: "Questions" },
  { href: "/exams", label: "Exams" },
  { href: "/grading", label: "Grading" },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
        <div className="ml-auto flex items-center gap-2">
          {mounted && (
            <>
              <span className="text-xs text-muted-foreground">🌞</span>
              <Switch
                checked={resolvedTheme === "dark"}
                onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
                aria-label="Alternar tema escuro/claro"
              />
              <span className="text-xs text-muted-foreground">🌚</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
