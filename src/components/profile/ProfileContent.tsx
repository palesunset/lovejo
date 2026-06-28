"use client";

import { motion } from "framer-motion";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { ProfileSignOutButton } from "@/components/profile/ProfileSignOutButton";

interface ProfileContentProps {
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export function ProfileContent({
  displayName,
  email,
  avatarUrl,
}: ProfileContentProps) {
  return (
    <div className="min-h-screen texture-paper px-4 py-10 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <UserAvatar
          name={displayName}
          avatarUrl={avatarUrl}
          size="lg"
          className="mx-auto"
        />
        <h1 className="font-heading text-2xl text-warm-brown mt-4">{displayName}</h1>
        <p className="font-body text-sm text-charcoal/50 mt-1">{email}</p>
        <ProfileSignOutButton />
      </motion.div>
    </div>
  );
}
