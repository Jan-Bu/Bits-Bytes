import React from "react";
import type { BlogPost } from "../pages/BlogSection";

export const PostWindow: React.FC<{ post: BlogPost; t: (k: string) => string }> = ({ post, t }) => {
  const changed = new Date(post.date).toLocaleDateString();
  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div className="p-3">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-6">{post.body}</pre>
      </div>
      <div className="text-xs bg-[#C0C0C0] border-t border-black px-2 py-1 select-none">
        {t("blog95.statusLine") || "Řádek 1, Sloupec 1 | Kódování: ANSI | Naposledy změněno:"} {changed}
      </div>
    </div>
  );
};
