import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, getStatusColor, calculateTimeLeft } from "@/lib/utils";
import StartupProfile from "@/components/founder/startup-profile";
import FundingRound from "@/components/founder/funding-round";
import CapTable from "@/components/founder/cap-table";

export default function FounderDashboard() {
  const { data: founderData, isLoading } = useQuery({
    queryKey: ["/api/founder/dashboard"],
  });

  const { data: startupData } = useQuery({
    queryKey: ["/api/founder/startup"],
  });

  const { data: fundingRoundData } = useQuery({
    queryKey: ["/api/founder/funding-round"],
  });

  const { data: pitchesData } = useQuery({
    queryKey: ["/api/founder/pitches"],
  });

  const { data: feedbackData } = useQuery({
    queryKey: ["/api/founder/feedback"],
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
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <i className="fas fa-rocket"></i>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">Founder Dashboard</h1>
                <p className="text-gray-500 text-sm">Welcome back, {founderData?.name || "Founder"}</p>
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

        {/* Startup Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <i className="fas fa-building text-primary-600"></i>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Current Valuation</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-900">{formatCurrency(founderData?.currentValuation || 0)}</p>
                    {founderData?.valuationChange && (
                      <span className="ml-2 flex items-center text-sm text-green-600">
                        <i className="fas fa-arrow-up mr-0.5"></i>
                        {founderData.valuationChange}
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
                  <i className="fas fa-money-bill-wave text-green-600"></i>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Funding Raised</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-900">{formatCurrency(founderData?.fundingRaised || 0)}</p>
                    <span className="ml-2 flex items-center text-sm text-gray-500">
                      {founderData?.fundingRounds || 0} round{founderData?.fundingRounds !== 1 ? 's' : ''}
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
                  <i className="fas fa-user-tie text-blue-600"></i>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Investor Interest</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-900">{founderData?.investorInterest || 0}</p>
                    {founderData?.newInvestors && (
                      <span className="ml-2 flex items-center text-sm text-green-600">
                        <i className="fas fa-arrow-up mr-0.5"></i>
                        {founderData.newInvestors} new
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
                  <i className="fas fa-star text-purple-600"></i>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Average Rating</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-900">{founderData?.averageRating || "N/A"}</p>
                    <div className="ml-2 text-sm text-gray-400">
                      {[...Array(5)].map((_, i) => {
                        const rating = parseFloat(founderData?.averageRating) || 0;
                        if (i < Math.floor(rating)) {
                          return <i key={i} className="fas fa-star text-yellow-400"></i>;
                        } else if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                          return <i key={i} className="fas fa-star-half-alt text-yellow-400"></i>;
                        } else {
                          return <i key={i} className="fas fa-star text-gray-300"></i>;
                        }
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Startup Profile Card */}
            {startupData && <StartupProfile startup={startupData} />}
            
            {/* Current Funding Round */}
            {fundingRoundData && <FundingRound fundingRound={fundingRoundData} />}
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Pitches */}
            <Card>
              <CardHeader className="px-6 py-5 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Pitches</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-5">
                  {pitchesData?.length ? (
                    pitchesData.map((pitch: any) => (
                      <div key={pitch.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-video text-primary-600"></i>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">{pitch.title}</h4>
                            <p className="text-xs text-gray-500">{pitch.scheduledDate}</p>
                          </div>
                          <Button variant="link" className="ml-auto text-sm text-primary-600 hover:text-primary-500">
                            {pitch.canJoin ? "Join" : "Prep"}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-gray-500 py-4">
                      No upcoming pitches
                    </div>
                  )}
                  
                  <Button variant="link" className="w-full text-center text-sm text-primary-600 hover:text-primary-500">
                    Schedule New Pitch
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Feedback & Ratings */}
            <Card>
              <CardHeader className="px-6 py-5 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900">Investor Feedback</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {/* Rating Summary */}
                {feedbackData && (
                  <>
                    <div className="flex justify-between mb-6">
                      <div className="text-center">
                        <div className="text-xs uppercase text-gray-500 font-medium">Team</div>
                        <div className="mt-1 text-xl font-semibold text-gray-900">{feedbackData.ratings?.team || "N/A"}</div>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => {
                            const rating = parseFloat(feedbackData.ratings?.team) || 0;
                            if (i < Math.floor(rating)) {
                              return <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>;
                            } else if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                              return <i key={i} className="fas fa-star-half-alt text-yellow-400 text-xs"></i>;
                            } else {
                              return <i key={i} className="fas fa-star text-gray-300 text-xs"></i>;
                            }
                          })}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs uppercase text-gray-500 font-medium">Product</div>
                        <div className="mt-1 text-xl font-semibold text-gray-900">{feedbackData.ratings?.product || "N/A"}</div>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => {
                            const rating = parseFloat(feedbackData.ratings?.product) || 0;
                            if (i < Math.floor(rating)) {
                              return <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>;
                            } else if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                              return <i key={i} className="fas fa-star-half-alt text-yellow-400 text-xs"></i>;
                            } else {
                              return <i key={i} className="fas fa-star text-gray-300 text-xs"></i>;
                            }
                          })}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs uppercase text-gray-500 font-medium">Market</div>
                        <div className="mt-1 text-xl font-semibold text-gray-900">{feedbackData.ratings?.market || "N/A"}</div>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => {
                            const rating = parseFloat(feedbackData.ratings?.market) || 0;
                            if (i < Math.floor(rating)) {
                              return <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>;
                            } else if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                              return <i key={i} className="fas fa-star-half-alt text-yellow-400 text-xs"></i>;
                            } else {
                              return <i key={i} className="fas fa-star text-gray-300 text-xs"></i>;
                            }
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Feedback Items */}
                    <div className="space-y-4">
                      {feedbackData.items?.map((item: any) => (
                        <div key={item.id} className="border-b border-gray-200 pb-4">
                          <div className="flex items-start">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={item.investor.avatar} alt={item.investor.name} />
                              <AvatarFallback>
                                {item.investor.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <h5 className="text-sm font-medium text-gray-900">{item.investor.name}</h5>
                              <p className="text-xs text-gray-500">{item.date}</p>
                              <p className="mt-2 text-sm text-gray-600">{item.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                <Button variant="link" className="w-full text-center text-sm text-primary-600 hover:text-primary-500 mt-4">
                  View All Feedback
                </Button>
              </CardContent>
            </Card>
            
            {/* Cap Table Summary */}
            <CapTable />
          </div>
        </div>
      </div>
    </div>
  );
}
