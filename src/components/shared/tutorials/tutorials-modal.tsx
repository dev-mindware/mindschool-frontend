"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  TUTORIAL_CATEGORIES,
  TUTORIAL_VIDEOS,
  YOUTUBE_CHANNEL_URL,
  TutorialCategory,
  TutorialVideo,
} from "@/constants/tutorials";
import { Play, ExternalLink, CheckCircle, Video } from "lucide-react";
import { cn } from "@/lib/utils";

// Official YouTube Brand SVG Icon (Red badge + White play symbol)
function YoutubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function TutorialsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TutorialCategory>("todos");
  // Default activeVideo to TUTORIAL_VIDEOS[0] so the playlist video is READY TO VIEW immediately
  const [activeVideo, setActiveVideo] = useState<TutorialVideo>(TUTORIAL_VIDEOS[0]);

  const filteredVideos =
    selectedCategory === "todos"
      ? TUTORIAL_VIDEOS
      : TUTORIAL_VIDEOS.filter((v) => v.category === selectedCategory);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-medium border-border hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-foreground transition-colors cursor-pointer"
          title="Tutoriais em Vídeo — Canal YouTube @mindware-y25"
        >
          <YoutubeIcon className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Tutoriais</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] max-h-[88vh] p-0 overflow-hidden flex flex-col gap-0 border-border bg-background">
        {/* Standard Mindgest Modal Header */}
        <div className="p-5 md:p-6 border-b border-border bg-muted/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <YoutubeIcon className="w-6 h-6 shrink-0" />
              <DialogTitle className="text-lg md:text-xl font-bold tracking-tight">
                Tutoriais em Vídeo & Playlist
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Assista aos tutoriais oficiais do Mindgest ou inscreva-se no canal do YouTube.
            </DialogDescription>
          </div>

          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              size="sm"
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs gap-2 shadow-xs cursor-pointer"
            >
              <YoutubeIcon className="w-4 h-4 shrink-0" />
              Inscrever-se no Canal @mindware-y25
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </Button>
          </a>
        </div>

        {/* Modal Main Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Video Player Section (Preloaded & Ready to View) */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                  {activeVideo.title}
                </h3>
              </div>
              {activeVideo.duration && (
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {activeVideo.duration}
                </span>
              )}
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-border">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=0`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeVideo.description}
            </p>
          </div>

          {/* Playlist & Category Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Playlist de Tutoriais ({filteredVideos.length})
              </h4>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {TUTORIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-md font-medium transition-colors shrink-0 cursor-pointer border",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Playlist Video Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {filteredVideos.map((video) => {
                const isCurrent = activeVideo.id === video.id;
                return (
                  <div
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    className={cn(
                      "group flex flex-col justify-between p-3.5 rounded-lg border cursor-pointer transition-all space-y-2.5",
                      isCurrent
                        ? "bg-primary/5 border-primary shadow-xs"
                        : "bg-card border-border hover:border-primary/40 hover:bg-accent/40"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {video.category}
                        </span>
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" /> A Reproduzir
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {video.duration}
                          </span>
                        )}
                      </div>

                      <h5 className="font-semibold text-xs md:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5">
                        <YoutubeIcon className="w-3.5 h-3.5 shrink-0 opacity-90" />
                        {video.title}
                      </h5>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <span className="text-[11px] font-medium text-primary flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" />
                        {isCurrent ? "A Assistir" : "Reproduzir"}
                      </span>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Abrir no YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
