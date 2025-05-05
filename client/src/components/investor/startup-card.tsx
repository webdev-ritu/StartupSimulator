import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface StartupCardProps {
  startup: {
    id: string;
    name: string;
    category: string;
    stage: string;
    description: string;
    icon: string;
    iconColor: string;
    ask: {
      amount: number;
      equity: number;
      valuation: number;
    };
    bookmarked: boolean;
  };
}

export default function StartupCard({ startup }: StartupCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(startup.bookmarked);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/investor/startups/${startup.id}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookmarked: !isBookmarked }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update bookmark status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsBookmarked(!isBookmarked);
      queryClient.invalidateQueries({ queryKey: ["/api/investor/startups"] });
      toast({
        title: isBookmarked ? "Startup removed from bookmarks" : "Startup bookmarked",
        description: isBookmarked 
          ? `${startup.name} has been removed from your bookmarks.` 
          : `${startup.name} has been added to your bookmarks.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: String(error) || "Failed to update bookmark status",
        variant: "destructive",
      });
    },
  });
  
  const handleBookmarkToggle = () => {
    bookmarkMutation.mutate();
  };
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
            <i className={`fas ${startup.icon} text-${startup.iconColor}`}></i>
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{startup.name}</h3>
            <p className="text-xs text-gray-500">{startup.category} • {startup.stage}</p>
          </div>
          <button 
            className={cn(
              "ml-auto",
              isBookmarked ? "text-primary-600" : "text-gray-400 hover:text-gray-500"
            )}
            onClick={handleBookmarkToggle}
            disabled={bookmarkMutation.isPending}
          >
            <Heart className={cn("h-5 w-5", isBookmarked && "fill-primary-600")} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4 h-12 line-clamp-2">{startup.description}</p>
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>Seeking: <span className="font-medium text-gray-700">{formatCurrency(startup.ask.amount)}</span></span>
          <span>Equity: <span className="font-medium text-gray-700">{startup.ask.equity}%</span></span>
          <span>Valuation: <span className="font-medium text-gray-700">{formatCurrency(startup.ask.valuation)}</span></span>
        </div>
        <div className="flex justify-between">
          <Button variant="default" className="px-4 py-2 text-sm">
            View Pitch
          </Button>
          <Button variant="outline" className="px-4 py-2 text-sm">
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
}
