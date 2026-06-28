"use client";

import { motion } from "framer-motion";
import { BookCover } from "@/components/books/BookCover";
import type { Book } from "@/lib/types/memory";

interface BookShelfProps {
  books: Book[];
}

/**
 * Homepage — starlit altar with fire & ice books.
 */
export function BookShelf({ books }: BookShelfProps) {
  return (
    <div className="relative min-h-dvh backdrop-home overflow-hidden">
      {/* Star field — base + twinkling layers */}
      <div
        className="backdrop-home__stars backdrop-home__stars--base pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div
        className="backdrop-home__stars backdrop-home__stars--twinkle-a pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div
        className="backdrop-home__stars backdrop-home__stars--twinkle-b pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div
        className="backdrop-home__stars backdrop-home__stars--twinkle-c pointer-events-none absolute inset-0"
        aria-hidden
      />

      {/* Nebula haze */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 25% 55%, rgba(255, 90, 30, 0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 75% 55%, rgba(100, 180, 255, 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Overhead lamp */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 8%, rgba(255, 220, 160, 0.12) 0%, transparent 65%)",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <header className="relative z-10 pt-10 sm:pt-14 pb-8 text-center px-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-body text-[0.65rem] sm:text-xs tracking-[0.35em] uppercase text-antique-gold/50 mb-2"
        >
          Two books, one story
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="font-heading text-3xl sm:text-4xl md:text-5xl gold-foil tracking-wide"
        >
          Our Story Board
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-accent text-xl sm:text-2xl text-cream-paper/40 mt-3"
        >
          A place where time stands still and stories remain
        </motion.p>
      </header>

      {/* Books on wooden altar */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-28">
        <div className="relative flex items-end justify-center gap-10 sm:gap-16 md:gap-24 pt-4 pb-6">
          {/* Fire glow */}
          <div
            className="pointer-events-none absolute left-[15%] top-[20%] h-40 w-40 rounded-full bg-orange-500/15 blur-3xl sm:h-52 sm:w-52"
            aria-hidden
          />
          {/* Ice glow */}
          <div
            className="pointer-events-none absolute right-[15%] top-[20%] h-40 w-40 rounded-full bg-sky-400/15 blur-3xl sm:h-52 sm:w-52"
            aria-hidden
          />

          {books.map((book, index) => (
            <BookCover key={book.id} book={book} index={index} />
          ))}
        </div>

        {/* Altar shelf surface */}
        <div className="relative mx-auto max-w-2xl">
          <div className="backdrop-home__altar-edge w-full" aria-hidden />
          <div className="backdrop-home__altar h-3 sm:h-4 rounded-b-sm" aria-hidden />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}
