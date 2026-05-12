export const PROJECTS = [
  {
    slug: "zara",
    name1: "Zara",
    name2: "Home",
    services: "research / design / art direction / motion",
    role: "lead designer",
    year: "2022",
    cover: "/projects/zara-home-preview.webp",
    detail: {
      title: "Zara Home",
      text1:
        "A student project that outgrew its brief. Full e-commerce redesign for Zara Home — homepage, catalogue, product page, cart, and checkout.",
      text2:
        "The question wasn't how to make it prettier. It was how to make a shopping experience feel like browsing a magazine.",
      email: "nikkoz.hello@gmail.com",
      images: [
        // place screenshots here, e.g. "/projects/zara/01.webp"
      ],
    },
  },
  {
    slug: "xerox",
    name1: "Xerox",
    name2: "PARC",
    services: "research / design / art direction / motion",
    role: "lead designer",
    year: "2022",
    cover: "/zara-cover.png",
    detail: {
      title: "Xerox PARC",
      text1: "",
      text2: "",
      email: "nikkoz.hello@gmail.com",
      images: [],
    },
  },
  {
    slug: "volvo",
    name1: "Volvo",
    name2: "S90",
    services: "research / design / art direction / motion / 3d",
    role: "lead designer",
    year: "2023",
    cover: "/zara-cover.png",
    detail: {
      title: "Volvo S90",
      text1: "",
      text2: "",
      email: "nikkoz.hello@gmail.com",
      images: [],
    },
  },
  {
    slug: "sephora",
    name2: "Sephora",
    services: "research / design / art direction / motion",
    role: "lead designer",
    year: "2024",
    cover: "/zara-cover.png",
    detail: {
      title: "Sephora",
      text1: "",
      text2: "",
      email: "nikkoz.hello@gmail.com",
      images: [],
    },
  },
];

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug) || null;
}
