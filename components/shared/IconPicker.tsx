"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, X, Loader2, Filter } from "lucide-react";
import * as LucideIcons from "lucide-react";

// --- DATA & CONSTANTS ---
const IGNORED_KEYS = ["createLucideIcon", "icons", "lucide-react", "default"];
const ICON_LIST = Object.keys(LucideIcons).filter(
  (key) => isNaN(Number(key)) && !IGNORED_KEYS.includes(key)
);

const LUCIDE_CATEGORIES = [
  { label: "Arrows", keywords: ["arrow", "chevron", "caret", "corner", "expand", "shrink", "move", "refresh", "rotate", "undo", "redo"] },
  { label: "Communication", keywords: ["mail", "message", "inbox", "send", "chat", "phone", "contact", "call", "signal", "wifi"] },
  { label: "Charts & Analytics", keywords: ["chart", "bar", "line", "pie", "activity", "graph", "trend", "analytics", "presentation"] },
  { label: "Devices", keywords: ["monitor", "laptop", "phone", "smartphone", "tablet", "watch", "tv", "camera", "printer", "battery", "cpu", "server", "hard-drive", "database", "keyboard", "mouse"] },
  { label: "Files & Folders", keywords: ["file", "folder", "document", "paper", "sheet", "page", "archive", "box", "clipboard", "copy", "save"] },
  { label: "Users & People", keywords: ["user", "person", "people", "group", "team", "account", "profile", "face", "smile"] },
  { label: "Money & Shopping", keywords: ["shopping", "cart", "bag", "store", "shop", "tag", "price", "credit-card", "wallet", "gift", "dollar", "euro", "bank", "coins"] },
  { label: "Media", keywords: ["play", "pause", "stop", "rewind", "forward", "skip", "volume", "music", "video", "film", "image", "mic", "headphones"] },
  { label: "Security", keywords: ["lock", "unlock", "key", "shield", "protect", "security", "user-check", "fingerprint"] },
  { label: "Design & Edit", keywords: ["pen", "pencil", "brush", "palette", "color", "crop", "layer", "layout", "grid", "ruler", "scissors", "edit", "trash"] },
  { label: "Time & Date", keywords: ["calendar", "date", "clock", "time", "watch", "schedule", "timer", "alarm"] },
  { label: "Weather & Nature", keywords: ["sun", "moon", "cloud", "rain", "snow", "wind", "storm", "thermometer", "umbrella", "leaf", "flower", "tree"] },
  { label: "Navigation & Maps", keywords: ["map", "pin", "location", "globe", "compass", "flag", "landmark", "navigation", "route"] },
  { label: "Brands", keywords: ["github", "facebook", "twitter", "instagram", "linkedin", "youtube", "twitch", "chrome", "slack", "dribbble", "codepen", "framer", "gitlab", "figma"] },
];

// --- HELPER COMPONENT ---
const IconRender = ({ name, className }: { name: string; className?: string }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name];
  if (!IconComponent) return <X className={className} />;
  return <IconComponent className={className} />;
};

// --- MAIN COMPONENT PROPS ---
interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  error?: boolean;
}

export function IconPicker({ value, onChange, error }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(100);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (open) {
      setVisibleCount(100);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [open, activeCategory, search]);

  // Filtering Logic
  const filteredIcons = useMemo(() => {
    let result = ICON_LIST;

    if (activeCategory !== "All") {
      const category = LUCIDE_CATEGORIES.find((c) => c.label === activeCategory);
      if (category) {
        result = result.filter((name) =>
          category.keywords.some((k) => name.toLowerCase().includes(k))
        );
      }
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((name) => name.toLowerCase().includes(lowerSearch));
    }

    return result;
  }, [search, activeCategory]);

  const visibleIcons = filteredIcons.slice(0, visibleCount);

  // Infinite Scroll Handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      if (visibleCount < filteredIcons.length) {
        setVisibleCount((prev) => prev + 100);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`w-full justify-between font-normal ${!value && "text-muted-foreground"} ${error ? "border-red-500" : ""}`}
        >
          <span className="flex items-center gap-2">
            {value ? (
              <>
                <div className="bg-slate-100 p-1 rounded-sm">
                  <IconRender name={value} className="h-4 w-4 text-slate-700" />
                </div>
                {value}
              </>
            ) : (
              "Pilih Icon..."
            )}
          </span>
          <Search className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b space-y-3">
          <DialogTitle>Pilih Icon</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari icon (contoh: user, home, setting)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-slate-50 border-slate-200"
              autoFocus
            />
          </div>
        </DialogHeader>

        {/* Categories */}
        <div className="border-b bg-slate-50/50">
          <div className="flex overflow-x-auto py-3 px-4 gap-2 no-scrollbar items-center">
            <Button
              variant={activeCategory === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("All")}
              className="h-8 rounded-full px-4 text-xs shadow-sm"
            >
              All Icons
            </Button>
            <div className="w-[1px] h-5 bg-slate-300 mx-1"></div>
            {LUCIDE_CATEGORIES.map((cat) => (
              <Button
                key={cat.label}
                variant={activeCategory === cat.label ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(cat.label)}
                className={`h-8 rounded-full px-4 text-xs whitespace-nowrap border ${
                  activeCategory === cat.label
                    ? "bg-slate-200 border-slate-300 text-slate-900"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid Icons */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 bg-slate-50/30"
          onScroll={handleScroll}
        >
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 content-start">
            {visibleIcons.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground opacity-70">
                <Filter className="h-12 w-12 mb-3 stroke-1 text-slate-300" />
                <p className="font-medium">Tidak ditemukan icon</p>
                <p className="text-xs">Coba kata kunci atau kategori lain.</p>
              </div>
            ) : (
              visibleIcons.map((iconName) => (
                <div
                  key={iconName}
                  className={`
                    group flex flex-col items-center justify-center gap-2 p-3 rounded-lg cursor-pointer border bg-white transition-all duration-200
                    ${
                      value === iconName
                        ? "border-primary ring-2 ring-primary ring-opacity-20 bg-primary/5 z-10"
                        : "border-slate-100 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
                    }
                  `}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                >
                  <IconRender
                    name={iconName}
                    className={`h-6 w-6 transition-colors ${
                      value === iconName
                        ? "text-primary"
                        : "text-slate-600 group-hover:text-slate-900"
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 truncate w-full text-center group-hover:text-slate-800 font-medium">
                    {iconName}
                  </span>
                </div>
              ))
            )}

            {visibleCount < filteredIcons.length && (
              <div className="col-span-full py-6 flex justify-center">
                <Loader2 className="animate-spin h-6 w-6 text-primary/50" />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-3 px-6 bg-white flex justify-between items-center text-xs text-muted-foreground shadow-sm z-10">
          <div className="flex items-center gap-2">
            <span>Terpilih: </span>
            <Badge variant="outline" className="font-mono bg-slate-50">
              {value || "-"}
            </Badge>
          </div>
          <span>
            {visibleIcons.length} dari {filteredIcons.length} icon
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}