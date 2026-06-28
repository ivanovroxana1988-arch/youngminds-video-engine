import { GeneratedPost } from "@/types/content";

export type PhotoLibraryItem = {
  id: string;
  label: string;
  theme: string;
  url: string;
};

// Put real YoungMinds photos in /public/photos and replace/add entries here.
// Same-origin images export correctly to PNG from the SVG preview. External URLs may taint canvas export.
export const YOUNGMINDS_PHOTO_LIBRARY: PhotoLibraryItem[] = [
  { id: "robotica-01", label: "Robotică", theme: "robotica lego stem tehnologie", url: "/photos/robotica-01.jpg" },
  { id: "stem-01", label: "STEM", theme: "stem experimente masa copii", url: "/photos/stem-01.jpg" },
  { id: "pian-01", label: "Pian", theme: "pian muzica ritm", url: "/photos/pian-01.jpg" },
  { id: "taekwondo-01", label: "Tae-kwon do", theme: "taekwondo miscare disciplina", url: "/photos/taekwondo-01.jpg" },
  { id: "yoga-01", label: "Yoga", theme: "yoga calm respiratie copii", url: "/photos/yoga-01.jpg" },
  { id: "spatiu-joaca-01", label: "Spațiu de joacă", theme: "spatiu joaca afterschool copii", url: "/photos/spatiu-joaca-01.jpg" }
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ");
}

export function suggestPhotoForPost(post: GeneratedPost) {
  const haystack = normalize(`${post.photoTheme ?? ""} ${post.title} ${post.hook} ${post.visualBrief}`);

  const scored = YOUNGMINDS_PHOTO_LIBRARY.map((photo) => {
    const score = normalize(photo.theme)
      .split(" ")
      .filter(Boolean)
      .reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
    return { photo, score };
  }).sort((a, b) => b.score - a.score);

  return scored[0]?.score ? scored[0].photo : undefined;
}
