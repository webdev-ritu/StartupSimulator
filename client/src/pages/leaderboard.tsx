import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function Leaderboard() {
  const [timeRange, setTimeRange] = useState("all_time");
  const [selectedTab, setSelectedTab] = useState("valuation");
  
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["/api/leaderboard", { timeRange, category: selectedTab }],
  });
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white shadow mb-6 rounded-lg">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <i className="fas fa-trophy"></i>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-gray-500 text-sm">Top performing startups and investors</p>
              </div>
              <div className="ml-auto">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_time">All Time</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Leaderboard */}
        <Card>
          <CardHeader className="px-6 py-5 border-b">
            <Tabs
              defaultValue="valuation"
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="valuation">Valuation</TabsTrigger>
                <TabsTrigger value="funding">Funding Raised</TabsTrigger>
                <TabsTrigger value="investor_interest">Investor Interest</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 animate-pulse">
                <div className="grid gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">Rank</TableHead>
                    <TableHead>Startup</TableHead>
                    {selectedTab === "valuation" && (
                      <TableHead className="text-right">Valuation</TableHead>
                    )}
                    {selectedTab === "funding" && (
                      <TableHead className="text-right">Funding Raised</TableHead>
                    )}
                    {selectedTab === "investor_interest" && (
                      <TableHead className="text-right">Investor Interest</TableHead>
                    )}
                    <TableHead className="text-center">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData?.startups.map((startup: any, index: number) => (
                    <TableRow key={startup.id}>
                      <TableCell className="font-medium text-center">
                        {index === 0 && <i className="fas fa-trophy text-yellow-400 mr-1"></i>}
                        {index === 1 && <i className="fas fa-trophy text-gray-400 mr-1"></i>}
                        {index === 2 && <i className="fas fa-trophy text-amber-700 mr-1"></i>}
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={startup.logo} alt={startup.name} />
                            <AvatarFallback>{startup.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{startup.name}</div>
                            <div className="text-sm text-gray-500">{startup.category}</div>
                          </div>
                        </div>
                      </TableCell>
                      {selectedTab === "valuation" && (
                        <TableCell className="text-right font-medium">
                          {formatCurrency(startup.valuation)}
                        </TableCell>
                      )}
                      {selectedTab === "funding" && (
                        <TableCell className="text-right font-medium">
                          {formatCurrency(startup.fundingRaised)}
                        </TableCell>
                      )}
                      {selectedTab === "investor_interest" && (
                        <TableCell className="text-right font-medium">
                          {startup.investorInterest}
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        {startup.change > 0 ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            <i className="fas fa-arrow-up mr-1"></i>
                            {startup.change}
                          </Badge>
                        ) : startup.change < 0 ? (
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            <i className="fas fa-arrow-down mr-1"></i>
                            {Math.abs(startup.change)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            <i className="fas fa-minus mr-1"></i>
                            0
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Investors Leaderboard */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Investors</h2>
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 animate-pulse">
                  <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">Rank</TableHead>
                      <TableHead>Investor</TableHead>
                      <TableHead className="text-right">Portfolio Value</TableHead>
                      <TableHead className="text-right">Investments</TableHead>
                      <TableHead className="text-center">Success Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData?.investors.map((investor: any, index: number) => (
                      <TableRow key={investor.id}>
                        <TableCell className="font-medium text-center">
                          {index === 0 && <i className="fas fa-trophy text-yellow-400 mr-1"></i>}
                          {index === 1 && <i className="fas fa-trophy text-gray-400 mr-1"></i>}
                          {index === 2 && <i className="fas fa-trophy text-amber-700 mr-1"></i>}
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={investor.avatar} alt={investor.name} />
                              <AvatarFallback>{investor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{investor.name}</div>
                              <div className="text-sm text-gray-500">{investor.company}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(investor.portfolioValue)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {investor.investments}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-primary-100 text-primary-800">
                            {investor.successRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
