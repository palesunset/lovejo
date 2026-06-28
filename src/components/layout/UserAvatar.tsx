import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

/**
 * User avatar with fallback initials icon.
 */
export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const initial = name?.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-warm-brown/10 flex items-center justify-center ring-2 ring-antique-gold/30",
        sizes[size],
        className,
      )}
      title={name}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name ?? "User"}
          fill
          className="object-cover"
          sizes="48px"
        />
      ) : initial ? (
        <span className="font-heading text-sm text-warm-brown">{initial}</span>
      ) : (
        <User className="h-1/2 w-1/2 text-warm-brown" />
      )}
    </div>
  );
}
