"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MapPin, Calendar, User, Trash2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatMemoryDateTime } from "@/lib/utils/dates";
import {
  deleteMemory,
  fetchMemoryByIdClient,
} from "@/lib/services/memory-service.client";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Memory } from "@/lib/types/memory";

interface MemoryModalProps {
  memory: Memory | null;
  onClose: () => void;
  onDeleted?: (memoryId: string) => void;
  /** Fetch full memory (photos, perspectives) on open — used for list/stamp views. */
  loadFullDetail?: boolean;
}

/**
 * Expanded memory card with photo, story, dual perspectives, and tags.
 * Content scrolls and long text wraps so entries stay readable.
 */
export const MemoryModal = memo(function MemoryModal({
  memory,
  onClose,
  onDeleted,
  loadFullDetail = false,
}: MemoryModalProps) {
  const isOpen = memory !== null;
  const [displayMemory, setDisplayMemory] = useState<Memory | null>(memory);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!memory) {
      setDisplayMemory(null);
      return;
    }

    setDisplayMemory(memory);

    if (!loadFullDetail) {
      return;
    }

    let cancelled = false;
    setLoadingDetail(true);

    void fetchMemoryByIdClient(memory.id)
      .then((full) => {
        if (!cancelled && full) {
          setDisplayMemory(full);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [memory, loadFullDetail]);

  useEffect(() => {
    if (!isOpen || !isSupabaseConfigured()) {
      setCurrentUserId(null);
      return;
    }

    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };

    void loadUser();
  }, [isOpen, memory?.id]);

  useEffect(() => {
    setConfirmDelete(false);
    setDeleteError(null);
  }, [memory?.id]);

  const canDelete =
    Boolean(displayMemory) &&
    Boolean(currentUserId) &&
    displayMemory?.createdById === currentUserId;

  const handleDelete = useCallback(async () => {
    if (!displayMemory || !canDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteMemory(displayMemory);
      onDeleted?.(displayMemory.id);
      onClose();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete memory",
      );
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }, [displayMemory, canDelete, onDeleted, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="overflow-x-hidden sm:max-w-3xl"
    >
      <AnimatePresence mode="wait">
        {displayMemory && (
          <motion.div
            key={displayMemory.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="texture-paper flex max-h-[100dvh] min-h-0 flex-col overflow-hidden sm:max-h-[90vh] sm:rounded-2xl"
          >
            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 25 }}
                className="relative w-full shrink-0 bg-cream-paper-dark p-4 sm:p-6 md:w-[42%] md:overflow-y-auto"
              >
                {loadingDetail ? (
                  <Skeleton className="aspect-square w-full max-w-sm md:mx-auto" />
                ) : (
                  (displayMemory.photos.length > 1
                    ? displayMemory.photos
                    : [{ imageUrl: displayMemory.photo, displayOrder: 0 }]
                  ).map((photo, i) => (
                    <div
                      key={`${displayMemory.id}-photo-${i}`}
                      className="relative mb-4 aspect-square w-full max-w-sm bg-white p-3 shadow-lg last:mb-0 md:mx-auto"
                      style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
                    >
                      <div className="relative h-full w-full overflow-hidden">
                        <Image
                          src={photo.imageUrl}
                          alt={`${displayMemory.title} photo ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 360px"
                          priority={i === 0}
                        />
                      </div>
                    </div>
                  ))
                )}
              </motion.div>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8 md:max-h-[90vh]">
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <h2 className="readable-text font-heading text-2xl text-warm-brown sm:text-3xl">
                    {displayMemory.title}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-charcoal/60">
                    <span className="flex min-w-0 items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="readable-text">
                        {formatMemoryDateTime(displayMemory.date)}
                      </span>
                    </span>
                    {displayMemory.location && (
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="readable-text">{displayMemory.location}</span>
                      </span>
                    )}
                    <span className="flex min-w-0 items-center gap-1">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="readable-text">{displayMemory.author}</span>
                    </span>
                  </div>
                </motion.div>

                {loadingDetail ? (
                  <div className="mt-5 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : (
                  <>
                    {displayMemory.story && (
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-5"
                      >
                        <p className="readable-text font-body text-base leading-relaxed text-charcoal/80 whitespace-pre-wrap">
                          {displayMemory.story}
                        </p>
                      </motion.div>
                    )}

                    {displayMemory.perspectives &&
                      displayMemory.perspectives.length > 0 && (
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.25 }}
                          className="mt-5 space-y-3"
                        >
                          <h3 className="font-heading text-sm uppercase tracking-wider text-warm-brown">
                            Thoughts
                          </h3>
                          {displayMemory.perspectives.map((p) => (
                            <div
                              key={`${p.memoryId}-${p.authorId ?? p.author}`}
                              className="min-w-0 rounded-lg border-l-2 border-antique-gold bg-cream-paper-dark/50 p-3"
                            >
                              <p className="readable-text font-accent text-sm text-soft-copper mb-1">
                                {p.author}
                              </p>
                              <p className="readable-text font-body text-sm italic text-charcoal/75 whitespace-pre-wrap">
                                &ldquo;{p.story}&rdquo;
                              </p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                  </>
                )}

                <p className="readable-text mt-4 font-accent text-lg text-warm-brown">
                  — {displayMemory.author}
                </p>

                {displayMemory.tags && displayMemory.tags.length > 0 && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 flex flex-wrap gap-2 pb-2"
                  >
                    {displayMemory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="readable-text rounded-full bg-warm-brown/10 px-3 py-1 font-body text-xs text-warm-brown"
                      >
                        #{tag}
                      </span>
                    ))}
                  </motion.div>
                )}

                {canDelete && (
                  <div className="mt-6 border-t border-warm-brown/10 pt-5">
                    {!confirmDelete ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete(true)}
                        className="text-red-700/80 hover:bg-red-50 hover:text-red-800 gap-2 inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete this entry
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="font-body text-sm text-charcoal/70">
                          Permanently delete &ldquo;{displayMemory.title}&rdquo;? This
                          cannot be undone.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={deleting}
                            onClick={() => void handleDelete()}
                            className="bg-red-700 text-white hover:bg-red-800 gap-2 inline-flex items-center"
                          >
                            {deleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            {deleting ? "Deleting…" : "Yes, delete"}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={deleting}
                            onClick={() => {
                              setConfirmDelete(false);
                              setDeleteError(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    {deleteError && (
                      <p className="mt-2 font-body text-sm text-red-600">
                        {deleteError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
});
