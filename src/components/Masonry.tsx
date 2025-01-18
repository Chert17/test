"use client";

import { useEffect, useState } from "react";

interface SongTile {
  id: number;
  content: string;
  height?: number; // Card height
}

interface MasonryGridProps {
  items: SongTile[];
}

const weightedHeights = [
  { height: 30, weight: 3 }, // Higher weight for smaller cards
  { height: 40, weight: 2 },
  { height: 50, weight: 1.5 },
  { height: 60, weight: 1 },
  { height: 70, weight: 0.5 }, // Lower weight for larger cards
];

// Function to select a random height considering weights
const getRandomHeight = () => {
  const totalWeight = weightedHeights.reduce((sum, h) => sum + h.weight, 0);
  const random = Math.random() * totalWeight;
  let cumulativeWeight = 0;

  for (const { height, weight } of weightedHeights) {
    cumulativeWeight += weight;
    if (random < cumulativeWeight) {
      return height;
    }
  }

  return weightedHeights[0].height; // Fallback to the minimum height in case of an error
};

// Object defining the number of columns for different screen sizes
const breakpointColumnsObj = {
  default: 7, // >=1440px
  1024: 5, // >=1024px
  768: 4, // >=768px
  0: 2, // <768px
};

const MasonryGrid: React.FC<MasonryGridProps> = ({ items }) => {
  const [columnItems, setColumnItems] = useState<
    { items: SongTile[]; height: number }[]
  >([]);
  const [columns, setColumns] = useState(breakpointColumnsObj.default);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newColumns =
        width >= 1440
          ? breakpointColumnsObj.default
          : width >= 1024
          ? breakpointColumnsObj[1024]
          : width >= 768
          ? breakpointColumnsObj[768]
          : breakpointColumnsObj[0];
      setColumns(newColumns);
    };

    handleResize(); // Set the number of columns on initial load
    window.addEventListener("resize", handleResize); // Listen for window resize events
    return () => window.removeEventListener("resize", handleResize); // Clean up event listener on unmount
  }, []);

  useEffect(() => {
    distributeItems();
  }, [items, columns]);

  const distributeItems = () => {
    const cols: { items: SongTile[]; height: number }[] = Array.from(
      { length: columns },
      () => ({
        items: [],
        height: 0,
      })
    );

    // Distribute cards across columns
    items.forEach((item) => {
      const height = getRandomHeight(); // Use the weighted random height function
      const columnIndex = cols.reduce(
        (minIndex, col, index) =>
          col.height < cols[minIndex].height ? index : minIndex,
        0
      );
      cols[columnIndex].items.push({ ...item, height });
      cols[columnIndex].height += height;
    });

    // Calculate the maximum column height
    const totalMaxHeight = Math.max(...cols.map((col) => col.height));

    // Adjust card heights in each column
    cols.forEach((col) => {
      const gap = totalMaxHeight - col.height;

      // If there's a gap, adjust card heights within the allowed range
      if (gap > 0 && col.items.length > 0) {
        const adjustmentFactor = gap / col.items.length;
        col.items = col.items.map((item) => ({
          ...item,
          height: Math.min(
            70, // Maximum height
            Math.max(30, item.height! + adjustmentFactor) // Adjust within the allowed range
          ),
        }));
        col.height = col.items.reduce((sum, item) => sum + item.height!, 0); // Recalculate column height
      }
    });

    setColumnItems(cols);
  };

  return (
    <div
      className="grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "16px",
      }}
    >
      {columnItems.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {col.items.map((item) => (
            <div
              key={item.id}
              className="bg-gray-200 rounded shadow-md"
              style={{
                height: `${item.height}vh`,
              }}
            >
              <p className="text-center p-4 text-black">{item.content}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;
