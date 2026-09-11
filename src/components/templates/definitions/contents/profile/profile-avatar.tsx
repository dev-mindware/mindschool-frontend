"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  userName?: string;
}

export function ProfileAvatar({ userName = "User" }: ProfileAvatarProps) {

  return (
    <div className="flex flex-col items-center gap-4">
      <div>
        <Avatar className="w-16 h-16 ring-4 ring-primary/20 shadow-lg">
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold tracking-widest shadow-inner">
            {userName[0]}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
