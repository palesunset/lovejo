"use client";

import { useState, useEffect } from "react";
import {
  ImagePlus,
  PenLine,
  MapPin,
  Calendar,
  Tag,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createMemory, uploadMemoryPhoto } from "@/lib/services/memory-service.client";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  normalizeMemoryDateForStorage,
  toDatetimeLocalValue,
} from "@/lib/utils/dates";
import {
  compressImageForUpload,
  formatFileSize,
  MAX_UPLOAD_BYTES,
} from "@/lib/utils/image-compress";
import { getBookIdForEmail } from "@/lib/utils/book-owners";
import type { Book } from "@/lib/types/memory";

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  defaultBookId?: string;
  onSuccess?: () => void;
}

/**
 * Full memory creation flow: photo, story, date, location, tags, perspective.
 */
export function AddMemoryModal({
  isOpen,
  onClose,
  books,
  defaultBookId,
  onSuccess,
}: AddMemoryModalProps) {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [perspective, setPerspective] = useState("");
  const [date, setDate] = useState(toDatetimeLocalValue());
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [bookId, setBookId] = useState(defaultBookId ?? books[0]?.id ?? "");
  const [userBook, setUserBook] = useState<Book | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !isSupabaseConfigured()) return;

    const resolveUserBook = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) return;

      const ownedBookId = getBookIdForEmail(user.email);
      if (!ownedBookId) return;

      const owned = books.find((b) => b.id === ownedBookId);
      if (owned) {
        setUserBook(owned);
        setBookId(owned.id);
      }
    };

    void resolveUserBook();
  }, [isOpen, books]);

  const resetForm = () => {
    setTitle("");
    setStory("");
    setPerspective("");
    setDate(toDatetimeLocalValue());
    setLocation("");
    setTags("");
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoNote(null);
    setError(null);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPhotoNote(null);

    try {
      const prepared = await compressImageForUpload(file);
      setPhoto(prepared);
      setPhotoPreview(URL.createObjectURL(prepared));

      if (prepared.size < file.size) {
        setPhotoNote(
          `Optimized from ${formatFileSize(file.size)} to ${formatFileSize(prepared.size)}`,
        );
      } else {
        setPhotoNote(formatFileSize(prepared.size));
      }
    } catch (err) {
      setPhoto(null);
      setPhotoPreview(null);
      setError(err instanceof Error ? err.message : "Could not process photo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please add a title");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured. Add your credentials to .env.local");
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to add memories");
        return;
      }

      const ownedBookId = getBookIdForEmail(user.email ?? "");
      if (ownedBookId && bookId !== ownedBookId) {
        setError("Memories can only be added to your own book");
        return;
      }

      let photos: { imageUrl: string; storagePath: string }[] | undefined;

      if (photo) {
        const uploaded = await uploadMemoryPhoto(photo, user.id);
        photos = [uploaded];
      }

      await createMemory(
        {
          bookId,
          title: title.trim(),
          story: story.trim(),
          date: normalizeMemoryDateForStorage(date),
          location: location.trim() || undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          photos,
          perspective: perspective.trim() || undefined,
        },
        user.id,
      );

      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save memory");
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    { icon: ImagePlus, label: "Add Photos", id: "photo" },
    { icon: PenLine, label: "Write Your Story", id: "story" },
    { icon: MapPin, label: "Add Location", id: "location" },
    { icon: Calendar, label: "Choose Date", id: "date" },
    { icon: Tag, label: "Add Tags / Mood", id: "tags" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="texture-paper min-h-full sm:min-h-0 sm:rounded-2xl p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-warm-brown mb-6">
          Add a New Memory
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Your book — each partner writes in their own */}
          <div className="rounded-xl border border-warm-brown/15 bg-cream-paper-dark/40 px-4 py-3">
            <p className="font-body text-xs text-charcoal/50 mb-1">
              {userBook
                ? "Adding to your book — your partner can read it anytime"
                : "Choose book"}
            </p>
            {userBook ? (
              <p className="font-heading text-base text-warm-brown">
                {userBook.title}
                {userBook.description && (
                  <span className="font-accent text-muted-green ml-2 text-sm">
                    · {userBook.description}
                  </span>
                )}
              </p>
            ) : (
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                className="w-full rounded-lg border border-warm-brown/20 bg-cream-paper px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-antique-gold/50"
              >
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                    {book.description ? ` — ${book.description}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Photo upload */}
          <div className="border-2 border-dashed border-warm-brown/20 rounded-xl p-6 text-center">
            {photoPreview ? (
              <div className="relative w-32 h-32 mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                {photoNote && (
                  <p className="font-body text-xs text-charcoal/50 mt-2 text-center">
                    {photoNote}
                  </p>
                )}
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-warm-brown/10 flex items-center justify-center">
                  <ImagePlus className="h-8 w-8 text-warm-brown" />
                </div>
                <span className="font-body text-sm text-charcoal/60">
                  Tap to upload a photo
                </span>
                <span className="font-body text-xs text-charcoal/40">
                  Large photos are auto-compressed (max{" "}
                  {Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action hints */}
          <div className="hidden sm:flex gap-2 flex-wrap">
            {actions.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warm-brown/5 text-xs font-body text-charcoal/50"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            ))}
          </div>

          <div>
            <label className="font-body text-sm text-charcoal/60 mb-1 block">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="First Coffee"
              className="w-full rounded-lg border border-warm-brown/20 bg-cream-paper px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-antique-gold/50"
              required
            />
          </div>

          <div>
            <label className="font-body text-sm text-charcoal/60 mb-1 block">
              Your Story
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={4}
              placeholder="Tell the story behind this moment..."
              className="w-full rounded-lg border border-warm-brown/20 bg-cream-paper px-3 py-2 font-body resize-none focus:outline-none focus:ring-2 focus:ring-antique-gold/50"
            />
          </div>

          <div>
            <label className="font-body text-sm text-charcoal/60 mb-1 block">
              Your Perspective (optional)
            </label>
            <textarea
              value={perspective}
              onChange={(e) => setPerspective(e.target.value)}
              rows={2}
              placeholder="How did this moment feel to you?"
              className="w-full rounded-lg border border-warm-brown/20 bg-cream-paper px-3 py-2 font-body resize-none focus:outline-none focus:ring-2 focus:ring-antique-gold/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-charcoal/60 mb-1 block">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-warm-brown/20 bg-cream-paper px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-antique-gold/50"
              />
            </div>
            <div>
              <label className="font-body text-sm text-charcoal/60 mb-1 block">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Downtown Café"
                className="w-full rounded-lg border border-warm-brown/20 bg-cream-paper px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-antique-gold/50"
              />
            </div>
          </div>

          <div>
            <label className="font-body text-sm text-charcoal/60 mb-1 block">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="firsts, coffee, memories"
              className="w-full rounded-lg border border-warm-brown/20 bg-cream-paper px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-antique-gold/50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-body">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Save Memory"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
