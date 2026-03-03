import React from "react";
import { Star } from "lucide-react";

const users = [
  { name: "John Smith", rating: 4.8, image: "/img1.png" },
  { name: "Michael Brown", rating: 4.7, image: "/img3.png" },
  { name: "Emily Johnson", rating: 4.6, image: "/img2.png" },
  { name: "Daniel Anderson", rating: 4.6, image: "/img7.png" },
  { name: "Sarah Davis", rating: 4.5, image: "/img4.png" },
  { name: "James Moore", rating: 4.5, image: "/img9.png" },
  { name: "Olivia Martin", rating: 4.7, image: "/img10.png" },
  { name: "David Wilson", rating: 4.9, image: "/img5.png" },
  { name: "Jessica Taylor", rating: 4.4, image: "/img6.png" },
  { name: "Laura Thomas", rating: 4.8, image: "/img8.png" },
];

const ImagesGrid = () => {
  return (
    <div className="columns-2 gap-4 space-y-2 max-w-md mx-auto">
      {users.map((user, index) => (
        <div
          key={index}
          className="break-inside-avoid bg-popover-foreground rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-secondary"
        >
          <img
            src={user.image}
            alt={user.name}
            className="w-full h-auto object-cover"
          />
          <div className="p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-secondary font-semibold">{user.name}</h3>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-secondary font-semibold ml-1">
                  {user.rating}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {user.rating >= 4.7 ? "Top Rated Doctor" : "Highly Rated"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImagesGrid;
