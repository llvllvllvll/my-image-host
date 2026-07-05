export type ImageCategory = "角色图" | "参考图" | "网站素材";

export type ImageItem = {
  id: string;
  title: string;
  fileName: string;
  category: ImageCategory;
  path: string;
};

export const images: ImageItem[] = [
  {
    id: "001",
    title: "character-sample-01",
    fileName: "character-sample-01.svg",
    category: "角色图",
    path: "/images/character-sample-01.svg",
  },
  {
    id: "002",
    title: "reference-sample-01",
    fileName: "reference-sample-01.svg",
    category: "参考图",
    path: "/images/reference-sample-01.svg",
  },
  {
    id: "003",
    title: "website-asset-sample-01",
    fileName: "website-asset-sample-01.svg",
    category: "网站素材",
    path: "/images/website-asset-sample-01.svg",
  },
];
