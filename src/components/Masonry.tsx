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

const randomHeights = [30, 40, 50, 60, 70]; // Allowed card heights (vh)

// Object defining the number of columns for different screen sizes
const breakpointColumnsObj = {
  default: 7, // Number of columns for screens >= 1024px
  1024: 5, // Number of columns for screens >= 768px
  768: 4, // Number of columns for screens >= 450px
  450: 2, // Number of columns for smaller screens
};

const MasonryGrid: React.FC<MasonryGridProps> = ({ items }) => {
  const [columnItems, setColumnItems] = useState<
    { items: SongTile[]; height: number }[]
  >([]);
  const [columns, setColumns] = useState(breakpointColumnsObj.default);

  useEffect(() => {
    // Function to update the number of columns based on the screen width
    const handleResize = () => {
      const width = window.innerWidth;
      const newColumns =
        width >= 1024
          ? breakpointColumnsObj.default
          : width >= 768
          ? breakpointColumnsObj[1024]
          : width >= 450
          ? breakpointColumnsObj[768]
          : breakpointColumnsObj[450];
      setColumns(newColumns);
    };

    handleResize(); // Set the number of columns on the initial load
    window.addEventListener("resize", handleResize); // Listen to screen width changes
    return () => window.removeEventListener("resize", handleResize); // Remove the listener on unmount
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
      const height =
        randomHeights[Math.floor(Math.random() * randomHeights.length)];
      const columnIndex = cols.reduce(
        (minIndex, col, index) =>
          col.height < cols[minIndex].height ? index : minIndex,
        0
      );
      cols[columnIndex].items.push({ ...item, height });
      cols[columnIndex].height += height;
    });

    // Calculate the maximum height of all columns
    const maxHeight = Math.max(...cols.map((col) => col.height));

    // Adjust the height of cards in each column
    cols.forEach((col) => {
      const gap = maxHeight - col.height;
      if (gap > 0 && col.items.length > 0) {
        const adjustmentFactor = gap / col.items.length;
        col.items = col.items.map((item) => ({
          ...item,
          height: item.height! + adjustmentFactor, // Proportionally increase the height
        }));
        col.height = col.items.reduce((sum, item) => sum + item.height!, 0); // Recalculate the column height
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
