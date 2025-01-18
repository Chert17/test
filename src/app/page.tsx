import MasonryGrid from "@/components/Masonry";

export default function Home() {
  const items = Array.from({ length: 37 }, (_, i) => ({
    id: i + 1,
    content: `Song ${i + 1}`,
  }));

  return (
    <div className="container mx-auto py-10">
      <MasonryGrid items={items} />
    </div>
  );
}
