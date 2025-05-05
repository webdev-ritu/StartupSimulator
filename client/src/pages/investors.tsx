import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Investor {
  id: string;
  name: string;
  company: string;
  avatar?: string;
  bio: string;
  investmentPreferences: {
    stages: string[];
    sectors: string[];
  };
  portfolio: {
    count: number;
    totalInvested: number;
  };
  availability: string;
}

export default function Investors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  
  const { data: investorsData, isLoading } = useQuery({
    queryKey: ["/api/investors", { search: searchQuery, sector: sectorFilter, stage: stageFilter }],
  });
  
  const { data: sectors } = useQuery({
    queryKey: ["/api/investors/sectors"],
  });
  
  const { data: stages } = useQuery({
    queryKey: ["/api/investors/stages"],
  });
  
  const filteredInvestors = investorsData?.investors || [];
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white shadow mb-6 rounded-lg">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="bg-accent-500 text-white p-2 rounded-lg">
                <i className="fas fa-user-tie"></i>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">Investors</h1>
                <p className="text-gray-500 text-sm">Connect with investors for your startup</p>
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
                  placeholder="Search investors..."
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
                  value={sectorFilter}
                  onValueChange={setSectorFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {sectors?.map((sector: any) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
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
        
        {/* Investors List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="border border-gray-200 rounded-lg h-40 bg-gray-100"></div>
              </div>
            ))}
          </div>
        ) : filteredInvestors.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investors found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredInvestors.map((investor: Investor) => (
              <Card key={investor.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start">
                    <div className="flex items-center md:items-start mb-4 md:mb-0">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={investor.avatar} alt={investor.name} />
                        <AvatarFallback>{investor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{investor.name}</h3>
                        <p className="text-sm text-gray-500">{investor.company}</p>
                        <div className="mt-2">
                          <Badge variant="outline" className="mr-1 bg-green-100 text-green-800">
                            {investor.availability}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:ml-8 flex-1">
                      <p className="text-sm text-gray-600 mb-4">{investor.bio}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Sectors</h4>
                          <div className="flex flex-wrap gap-1">
                            {investor.investmentPreferences.sectors.map((sector, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-100">
                                {sector}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Stages</h4>
                          <div className="flex flex-wrap gap-1">
                            {investor.investmentPreferences.stages.map((stage, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-100">
                                {stage}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Portfolio</h4>
                          <p className="text-sm text-gray-900">
                            {investor.portfolio.count} companies
                          </p>
                          <p className="text-sm text-gray-900">
                            {formatCurrency(investor.portfolio.totalInvested)} invested
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-end mt-4 gap-2">
                        <Button variant="outline">View Profile</Button>
                        <Button>Request Meeting</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {investorsData?.pagination && investorsData.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={investorsData.pagination.currentPage === 1}
              >
                Previous
              </Button>
              
              {[...Array(investorsData.pagination.totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={investorsData.pagination.currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  className="w-9"
                >
                  {i + 1}
                </Button>
              ))}
              
              <Button 
                variant="outline" 
                size="sm"
                disabled={investorsData.pagination.currentPage === investorsData.pagination.totalPages}
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
