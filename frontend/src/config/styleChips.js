import { Image as ImageIcon, FileText, Sparkles, Feather } from "lucide-react";

// Ids must match STYLE_DIRECTIVES in backend/config/designPreferences.js
export const STYLE_CHIPS = [
  { id: "graphic", label: "Graphic", icon: ImageIcon },
  { id: "text", label: "Text", icon: FileText },
  { id: "aesthetic", label: "Aesthetic", icon: Sparkles },
  { id: "minimal", label: "Minimal", icon: Feather }
];
