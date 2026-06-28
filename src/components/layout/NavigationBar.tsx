"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Search, User } from "lucide-react";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { useAuthUser } from "@/hooks/useAuthUser";
import { cn } from "@/lib/utils/cn";
import { buildLoginHref } from "@/lib/utils/login-redirect";
import type { Book } from "@/lib/types/memory";

const AddMemoryModal = dynamic(
  () =>
    import("@/components/memories/AddMemoryModal").then((mod) => ({
      default: mod.AddMemoryModal,
    })),
  { ssr: false },
);

interface NavigationBarProps {
  books?: Book[];
  initialUserId?: string | null;
}

const navItems = [
  { href: "/", icon: BookOpen, label: "Shelf" },
  { href: "/timeline", icon: Calendar, label: "Timeline" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/profile", icon: User, label: "Profile" },
];

/** Bottom navigation — starlit glass bar, hidden on immersive book routes. */
export function NavigationBar({
  books = [],
  initialUserId = null,
}: NavigationBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthUser({ initialUserId });
  const [showAddModal, setShowAddModal] = useState(false);

  if (pathname.startsWith("/book/")) {
    return null;
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleAddClick = () => {
    if (!isAuthenticated) {
      router.push(buildLoginHref(pathname));
      return;
    }
    setShowAddModal(true);
  };

  const profileHref = isAuthenticated ? "/profile" : buildLoginHref(pathname);

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-4 pb-5 pt-2 pointer-events-none"
        aria-label="Main navigation"
      >
        <motion.div
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 28, stiffness: 280, delay: 0.2 }}
          className="pointer-events-auto w-full max-w-sm"
        >
          <div
            className={cn(
              "relative grid grid-cols-5 items-end gap-0",
              "rounded-2xl border border-antique-gold/20",
              "bg-[#0a0e18]/88 backdrop-blur-xl",
              "px-1 pb-2 pt-3",
              "shadow-[0_12px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]",
            )}
          >
            {navItems.slice(0, 2).map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center justify-end gap-1 rounded-xl py-1.5 transition-colors",
                    active
                      ? "text-antique-gold-light"
                      : "text-cream-paper/40 hover:text-cream-paper/70",
                  )}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      active && "bg-antique-gold/15",
                    )}
                  >
                    <Icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.75} />
                  </span>
                  <span className="font-body text-[0.5rem] sm:text-[0.55rem] tracking-wide">
                    {label}
                  </span>
                </Link>
              );
            })}

            <div className="flex justify-center -mt-6 pb-0.5">
              <FloatingActionButton
                onClick={handleAddClick}
                aria-label={isAuthenticated ? "Add new memory" : "Sign in to add a memory"}
                className={cn(
                  !isLoading && !isAuthenticated && "opacity-90",
                )}
              />
            </div>

            {navItems.slice(2).map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              const linkHref = href === "/profile" ? profileHref : href;
              const linkLabel =
                href === "/profile" && !isAuthenticated ? "Sign in" : label;
              return (
                <Link
                  key={href}
                  href={linkHref}
                  className={cn(
                    "flex flex-col items-center justify-end gap-1 rounded-xl py-1.5 transition-colors",
                    active
                      ? "text-antique-gold-light"
                      : "text-cream-paper/40 hover:text-cream-paper/70",
                  )}
                  aria-label={linkLabel}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      active && "bg-antique-gold/15",
                    )}
                  >
                    <Icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.75} />
                  </span>
                  <span className="font-body text-[0.5rem] sm:text-[0.55rem] tracking-wide">
                    {linkLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </nav>

      {showAddModal && isAuthenticated && (
        <AddMemoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          books={books}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
