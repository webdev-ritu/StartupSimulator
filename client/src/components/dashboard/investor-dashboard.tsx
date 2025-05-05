import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import StartupCard from "@/components/investor/startup-card";
import PortfolioChart from "@/components/investor/portfolio-chart";

export default function InvestorDashboard() {
  const { data: investorData, isLoading } = useQuery({
    queryKey: ["/api/investor/dashboard"],
  });

  const { data: startupsData } = useQuery({
    queryKey: ["/api/investor/startups"],
  });

  const { data: portfolioData } = useQuery({
    queryKey: ["/api/investor/portfolio"],
  });

  const { data: pitchesData } = useQuery({
    queryKey: ["/api/investor/pitches"],
  });

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Role Header */}
        <div className="bg-white shadow mb-6 rounded-lg">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="bg-accent-500 text-white p-2 rounded-lg">
                <i className="fas fa-chart-line"></i>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">Investor Dashboard</h1>
                <p className="text-gray-500 text-sm">Welcome back, {investorData?.name || "Investor"}</p>
              </div>
              <div className="ml-auto">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <i className="fas fa-circle text-xs mr-1"></i>
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Investor Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-accent-100 rounded-md p-3">
                  <i className="fas fa-briefcase text-accent-600"></i>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-900">{formatCurrency(investorData?.portfolioValue || 0)}</p>
                    {investorData?.portfolioGrowth && (
                      <span className="ml-2 flex items-center text-sm text-green-600">
                        <i className="fas fa-arrow-up mr-0.5"></i>
                        {investorData.portfolioGrowth}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <i className="fas fa-rocket text-green-600"></i>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Investments</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-900">{investorData?.investments || 0}</p>
                    <span className="ml-2 flex items-center text-sm text-gray-500">
                      startups
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <i className="fas fa-envelope text-blue-600"></i>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">New Pitches</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-900">{investorData?.newPitches || 0}</p>
                    {investorData?.todayPitches && (
                      <span className="ml-2 flex items-center text-sm text-green-600">
                        <i className="fas fa-arrow-up mr-0.5"></i>
                        {investorData.todayPitches} today
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <i className="fas fa-calendar-alt text-purple-600"></i>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Upcoming Pitches</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-900">{investorData?.upcomingPitches || 0}</p>
                    <span className="ml-2 flex items-center text-sm text-gray-500">
                      this week
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Startup Discovery Section */}
        <Card className="mb-6">
          <CardHeader className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-900">Discover Startups</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Input
                  className="pl-8 pr-4 py-2"
                  placeholder="Search startups..."
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
              </div>
              <Button variant="outline" size="icon">
                <i className="fas fa-filter"></i>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {startupsData?.map((startup: any) => (
                <StartupCard key={startup.id} startup={startup} />
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button variant="outline">
                Load More
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Performance */}
          <Card>
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {portfolioData && <PortfolioChart portfolioData={portfolioData} />}
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">Total Invested</h4>
                  <p className="font-medium text-gray-900 mt-1">{formatCurrency(portfolioData?.totalInvested || 0)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">Current Value</h4>
                  <p className="font-medium text-gray-900 mt-1">{formatCurrency(portfolioData?.currentValue || 0)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">ROI</h4>
                  <p className={portfolioData?.roi >= 0 ? "font-medium text-green-600 mt-1" : "font-medium text-red-600 mt-1"}>
                    {portfolioData?.roi >= 0 ? "+" : ""}{portfolioData?.roi}%
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">Startups Funded</h4>
                  <p className="font-medium text-gray-900 mt-1">{portfolioData?.startupsFunded || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Scheduled Pitches */}
          <Card>
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Scheduled Pitches</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {pitchesData?.map((pitch: any) => (
                  <div key={pitch.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                          <i className={`fas ${pitch.startup.icon} text-${pitch.startup.iconColor}`}></i>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{pitch.startup.name}</h3>
                          <p className="text-xs text-gray-500">{pitch.scheduledDate} ({pitch.duration} min)</p>
                        </div>
                      </div>
                      <div>
                        {pitch.canJoin ? (
                          <Button size="sm" className="px-3 py-1.5 text-xs">
                            Join
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="px-3 py-1.5 text-xs">
                            {pitch.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button variant="link" className="text-sm text-primary-600 hover:text-primary-500">
                  View Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
