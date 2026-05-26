export type YouTubeVideo = {
  title: string;
  youtubeUrl: string;
  thumbnailPath: string;
  thumbnailText: string;
  categoryTag: string;
  curationLabel: string;
  duration: string;
  publishLabel: string;
  description: string;
};

// Single source of truth for Keys to AI homepage video cards.
// Titles below are sourced from the public YouTube video URLs.
// Thumbnail files are local copies of the public YouTube maxresdefault images
// so the site does not depend on hotlinked CSS background images rendering.
// TODO: Add confirmed duration and publishLabel only after verifying them on YouTube.
export const youtubeVideos: YouTubeVideo[] = [
  {
    title: "Stop Re-Explaining Yourself to Claude (Desktop Setup for Solopreneurs)",
    youtubeUrl: "https://www.youtube.com/watch?v=6tZTOkPWZ7o&t=3s",
    thumbnailPath: "/images/youtube/stop-re-explaining-claude.jpg",
    thumbnailText: "Stop Re-Explaining",
    categoryTag: "Claude",
    curationLabel: "Featured",
    duration: "",
    publishLabel: "",
    description:
      "Claude desktop setup tutorial for solopreneurs who want a reusable working context."
  },
  {
    title: "The 8-Tool AI Stack Every Solopreneur Needs in 2026",
    youtubeUrl: "https://www.youtube.com/watch?v=VquszjmTFrU",
    thumbnailPath: "/images/youtube/ai-tool-stack.jpg",
    thumbnailText: "AI Tool Stack",
    categoryTag: "AI Tools",
    curationLabel: "Most Watched",
    duration: "",
    publishLabel: "",
    description:
      "A Keys to AI guide to the core tools in a practical solopreneur AI workflow."
  },
  {
    title: "Bring Your AI Avatar to Life with HeyGen (Full Tutorial 2026)",
    youtubeUrl: "https://www.youtube.com/watch?v=R0EmUT4EX2g&t=2s",
    thumbnailPath: "/images/youtube/heygen-avatar.jpg",
    thumbnailText: "Avatar to Life",
    categoryTag: "Avatar",
    curationLabel: "Editor's Pick",
    duration: "",
    publishLabel: "",
    description:
      "Step-by-step HeyGen tutorial for building your AI avatar workflow."
  },
  {
    title: "Build Your AI Avatar Voice Without Sounding Robotic",
    youtubeUrl: "https://www.youtube.com/watch?v=KTlUnyth0JE&t=14s",
    thumbnailPath: "/images/youtube/natural-ai-voice.jpg",
    thumbnailText: "Natural AI Voice",
    categoryTag: "Avatar",
    curationLabel: "New",
    duration: "",
    publishLabel: "",
    description:
      "How to design a natural-sounding AI voice for your content."
  },
  {
    title: "Your First AI Headshot in Midjourney (Tested Prompt Included)",
    youtubeUrl: "https://www.youtube.com/watch?v=vcnCTvfcBPE&t=3s",
    thumbnailPath: "/images/youtube/midjourney-headshot.jpg",
    thumbnailText: "AI Headshot",
    categoryTag: "Midjourney",
    curationLabel: "Featured Guide",
    duration: "",
    publishLabel: "",
    description:
      "Create a professional AI headshot using a tested Midjourney prompt."
  }
];
