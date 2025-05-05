import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import StartupCard from "@/components/investor/startup-card";

export default function Startups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  
  const { data: startupsData, isLoading } = useQuery({
    queryKey: ["/api/startups", { search: searchQuery, category: categoryFilter, stage: stageFilter }],
  });
  
  const { data: categories } = useQuery({
    queryKey: ["/api/startups/categories"],
  });
  
  const { data: stages } = useQuery({
    queryKey: ["/api/startups/stages"],
  });
  
  const filteredStartups = startupsData?.startups || [];
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white shadow mb-6 rounded-lg">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <i className="fas fa-rocket"></i>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">Startups</h1>
                <p className="text-gray-500 text-sm">Discover promising startups</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search startups..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fas fa-search"></i>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={stageFilter}
                  onValueChange={setStageFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stages?.map((stage: any) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Startups Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="border border-gray-200 rounded-lg h-56 bg-gray-100"></div>
              </div>
            ))}
          </div>
        ) : filteredStartups.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No startups found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStartups.map((startup: any) => (
                <StartupCard key={startup.id} startup={startup} />
              ))}
            </div>
            
            {startupsData?.pagination && startupsData.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={startupsData.pagination.currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(startupsData.pagination.totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={startupsData.pagination.currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      className="w-9"
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={startupsData.pagination.currentPage === startupsData.pagination.totalPages}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
