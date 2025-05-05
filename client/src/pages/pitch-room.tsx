import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Chat from "@/components/pitch-room/chat";
import PitchDeckViewer from "@/components/pitch-room/pitch-deck-viewer";

export default function PitchRoom() {
  const [activePitchId, setActivePitchId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: pitchesData, isLoading: isPitchesLoading } = useQuery({
    queryKey: ["/api/pitch-rooms"],
  });
  
  const { data: activePitchData, isLoading: isActivePitchLoading } = useQuery({
    queryKey: ["/api/pitch-rooms", activePitchId],
    enabled: !!activePitchId,
  });
  
  useEffect(() => {
    if (pitchesData?.length && !activePitchId) {
      setActivePitchId(pitchesData[0].id);
    }
  }, [pitchesData, activePitchId]);
  
  if (isPitchesLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!pitchesData?.length) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No Pitch Rooms Available</h2>
              <p className="text-gray-500 mb-4">You don't have any active pitch rooms. Create or join a pitch room to get started.</p>
              <Button>Schedule a Pitch</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white shadow mb-6 rounded-lg">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <i className="fas fa-comments"></i>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">Pitch Room</h1>
                <p className="text-gray-500 text-sm">Connect with founders and investors</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Pitch Room List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-md font-semibold">Your Pitch Rooms</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {pitchesData.map((pitch: any) => (
                    <div 
                      key={pitch.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${
                        activePitchId === pitch.id ? "bg-gray-50" : ""
                      }`}
                      onClick={() => setActivePitchId(pitch.id)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={pitch.avatarUrl} alt={pitch.name} />
                          <AvatarFallback>{pitch.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">{pitch.name}</h3>
                            <Badge 
                              variant="outline"
                              className={
                                pitch.status === "active" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {pitch.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{pitch.scheduledFor}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Active Pitch Room */}
          <div className="lg:col-span-3">
            {isActivePitchLoading ? (
              <div className="animate-pulse">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            ) : activePitchData ? (
              <Tabs defaultValue="pitchdeck" className="h-[calc(100vh-200px)]">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{activePitchData.name}</h2>
                    <p className="text-sm text-gray-500">{activePitchData.description}</p>
                  </div>
                  <TabsList>
                    <TabsTrigger value="pitchdeck">Pitch Deck</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="pitchdeck" className="h-full mt-0">
                  <PitchDeckViewer pitchDeck={activePitchData.pitchDeck} />
                </TabsContent>
                
                <TabsContent value="chat" className="h-full mt-0">
                  <Chat 
                    roomId={activePitchData.id} 
                    userId={activePitchData.currentUser.id} 
                    userRole={activePitchData.currentUser.role}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-gray-50 rounded-lg">
                <p className="text-gray-500">Select a pitch room to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
