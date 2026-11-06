export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} · MotoTaller` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · MotoTaller` },
    { property: "og:description", content: description },
    { name: "robots", content: "noindex" },
  ],
});
