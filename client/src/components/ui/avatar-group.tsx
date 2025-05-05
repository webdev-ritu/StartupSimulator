import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    image?: string;
    name: string;
  }[];
  max?: number;
}

export function AvatarGroup({
  items,
  max = 4,
  className,
  ...props
}: AvatarGroupProps) {
  const displayItems = max ? items.slice(0, max) : items;
  const overflowCount = items.length - displayItems.length;

  return (
    <div
      className={cn("flex items-center -space-x-2", className)}
      {...props}
    >
      {displayItems.map((item, index) => (
        <Avatar
          key={index}
          className="border-2 border-background transition-transform hover:translate-y-1"
        >
          {item.image && <AvatarImage src={item.image} alt={item.name} />}
          <AvatarFallback className="text-xs">
            {item.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {overflowCount > 0 && (
        <Avatar className="border-2 border-background bg-muted">
          <AvatarFallback className="text-xs">
            +{overflowCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
