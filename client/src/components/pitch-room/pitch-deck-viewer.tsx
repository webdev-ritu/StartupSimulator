import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize, 
  Minimize
} from "lucide-react";

interface PitchDeckViewerProps {
  pitchDeck: {
    id: string;
    name: string;
    totalSlides: number;
    downloadUrl: string;
    slides: {
      id: number;
      imageUrl: string;
    }[];
  };
}

export default function PitchDeckViewer({ pitchDeck }: PitchDeckViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };
  
  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev < pitchDeck.totalSlides - 1 ? prev + 1 : prev));
  };
  
  const handleFullscreenToggle = () => {
    const viewer = document.getElementById("pitch-deck-viewer");
    
    if (!isFullscreen) {
      if (viewer?.requestFullscreen) {
        viewer.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <Card className="flex flex-col h-full" id="pitch-deck-viewer">
      <CardHeader className="px-4 py-2 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">{pitchDeck.name}</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleFullscreenToggle}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={pitchDeck.downloadUrl} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="relative flex-1 flex items-center justify-center bg-gray-50">
          {pitchDeck.slides.length > 0 ? (
            <img
              src={pitchDeck.slides[currentSlide].imageUrl}
              alt={`Slide ${currentSlide + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-center text-gray-500">
              <p>No slides available</p>
            </div>
          )}
          
          {pitchDeck.slides.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                onClick={handleNextSlide}
                disabled={currentSlide === pitchDeck.totalSlides - 1}
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
        
        <div className="p-2 border-t flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Slide {currentSlide + 1} of {pitchDeck.totalSlides}
          </span>
          <div className="flex space-x-1">
            {pitchDeck.slides.map((_, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`w-2 h-2 p-0 rounded-full ${currentSlide === index ? "bg-primary-600" : "bg-gray-300"}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
