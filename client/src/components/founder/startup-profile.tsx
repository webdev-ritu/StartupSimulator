import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface StartupProfileProps {
  startup: {
    id: string;
    name: string;
    tagline: string;
    logo?: string;
    category: string;
    location: string;
    teamSize: number;
    marketSize: string;
    businessModel: string;
    stage: string;
    pitchDeck?: {
      filename: string;
      updatedAt: string;
      slides: number;
      url: string;
    };
    profileCompletion: number;
  };
}

export default function StartupProfile({ startup }: StartupProfileProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("pitchDeck", file);
      
      const response = await fetch(`/api/founder/startup/${startup.id}/pitch-deck`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload pitch deck");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ["/api/founder/startup"] });
      toast({
        title: "Success",
        description: "Pitch deck uploaded successfully",
      });
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Error",
        description: String(error) || "Failed to upload pitch deck",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      uploadMutation.mutate(file);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Startup Profile</h2>
          <Button variant="link" className="text-primary-600 hover:text-primary-500 text-sm">
            <i className="fas fa-edit mr-1"></i> Edit Profile
          </Button>
        </div>
        
        {/* Profile Completion Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-medium text-gray-700">{startup.profileCompletion}%</span>
          </div>
          <Progress value={startup.profileCompletion} className="h-2" />
          <p className="mt-2 text-xs text-gray-500">Complete your profile to increase investor visibility.</p>
        </div>
        
        {/* Company Info */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-start">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {startup.logo ? (
                <img src={startup.logo} alt={startup.name} className="w-12 h-12 object-contain" />
              ) : (
                <i className="fas fa-building text-2xl text-gray-400"></i>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{startup.name}</h3>
              <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500">
                <span className="mr-4">
                  <i className="fas fa-tag mr-1"></i> {startup.category}
                </span>
                <span className="mr-4">
                  <i className="fas fa-map-marker-alt mr-1"></i> {startup.location}
                </span>
                <span>
                  <i className="fas fa-users mr-1"></i> {startup.teamSize} team members
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{startup.tagline}</p>
            </div>
          </div>
          
          {/* Quick Info Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Market Size</h4>
              <p className="font-medium text-gray-900 mt-1">{startup.marketSize}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Business Model</h4>
              <p className="font-medium text-gray-900 mt-1">{startup.businessModel}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Stage</h4>
              <p className="font-medium text-gray-900 mt-1">{startup.stage}</p>
            </div>
          </div>
          
          {/* Pitch Deck */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700">Pitch Deck</h4>
            {startup.pitchDeck ? (
              <div className="mt-2 border border-gray-200 rounded-lg p-3 flex items-center">
                <div className="w-10 h-10 flex-shrink-0 bg-red-100 rounded flex items-center justify-center">
                  <i className="fas fa-file-pdf text-red-500"></i>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{startup.pitchDeck.filename}</p>
                  <p className="text-xs text-gray-500">
                    Updated {new Date(startup.pitchDeck.updatedAt).toLocaleDateString()} • {startup.pitchDeck.slides} slides
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <a 
                    href={startup.pitchDeck.url} 
                    download={startup.pitchDeck.filename}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    <i className="fas fa-download"></i>
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-2 border border-gray-200 rounded-lg p-3 flex items-center justify-center">
                <p className="text-sm text-gray-500">No pitch deck uploaded yet</p>
              </div>
            )}
            <div className="mt-3 relative">
              <input
                type="file"
                id="pitchDeckUpload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button
                variant="link"
                className="text-sm text-primary-600 hover:text-primary-500"
                disabled={isUploading}
              >
                <i className="fas fa-upload mr-1"></i> 
                {isUploading ? "Uploading..." : "Upload New Version"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
