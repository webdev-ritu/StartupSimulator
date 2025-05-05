import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { formatCurrency, getStatusColor, calculateTimeLeft } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Investor {
  id: string;
  name: string;
  company: string;
  avatar?: string;
  status: string;
  offer?: {
    amount: number;
    equity: number;
    valuation: number;
  };
  meetingSchedule?: string;
}

interface FundingRoundProps {
  fundingRound: {
    id: string;
    status: string;
    askAmount: number;
    equityOffered: number;
    impliedValuation: number;
    closingDate: string;
    progress: {
      raised: number;
      total: number;
      percentage: number;
    };
    interestedInvestors: Investor[];
  };
}

export default function FundingRound({ fundingRound }: FundingRoundProps) {
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isCounterDialogOpen, setIsCounterDialogOpen] = useState(false);
  const [counterOffer, setCounterOffer] = useState({
    amount: 0,
    equity: 0,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const acceptOfferMutation = useMutation({
    mutationFn: (investorId: string) => 
      apiRequest("POST", `/api/founder/funding-rounds/${fundingRound.id}/offers/${investorId}/accept`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/founder/funding-round"] });
      queryClient.invalidateQueries({ queryKey: ["/api/founder/dashboard"] });
      setIsAcceptDialogOpen(false);
      toast({
        title: "Offer accepted",
        description: `You've successfully accepted the investment offer from ${selectedInvestor?.name}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to accept offer: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const counterOfferMutation = useMutation({
    mutationFn: (data: { investorId: string; amount: number; equity: number }) => 
      apiRequest("POST", `/api/founder/funding-rounds/${fundingRound.id}/offers/${data.investorId}/counter`, { 
        amount: data.amount, 
        equity: data.equity 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/founder/funding-round"] });
      setIsCounterDialogOpen(false);
      toast({
        title: "Counter offer sent",
        description: `Your counter offer has been sent to ${selectedInvestor?.name}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send counter offer: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleAcceptOffer = () => {
    if (selectedInvestor) {
      acceptOfferMutation.mutate(selectedInvestor.id);
    }
  };
  
  const handleCounterOffer = () => {
    if (selectedInvestor) {
      counterOfferMutation.mutate({
        investorId: selectedInvestor.id,
        amount: counterOffer.amount,
        equity: counterOffer.equity,
      });
    }
  };
  
  const handleOpenAcceptDialog = (investor: Investor) => {
    setSelectedInvestor(investor);
    setIsAcceptDialogOpen(true);
  };
  
  const handleOpenCounterDialog = (investor: Investor) => {
    setSelectedInvestor(investor);
    if (investor.offer) {
      setCounterOffer({
        amount: investor.offer.amount,
        equity: investor.offer.equity,
      });
    }
    setIsCounterDialogOpen(true);
  };
  
  const timeLeft = calculateTimeLeft(fundingRound.closingDate);
  
  return (
    <>
      <Card>
        <CardHeader className="px-6 py-5 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Current Funding Round</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Active Round
              </Badge>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">
                Seeking {formatCurrency(fundingRound.askAmount)} for {fundingRound.equityOffered}% equity
              </h3>
              <p className="mt-1 text-sm text-gray-500">Round closes in {timeLeft}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Implied Valuation</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(fundingRound.impliedValuation)}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Funding Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {formatCurrency(fundingRound.progress.raised)} / {formatCurrency(fundingRound.progress.total)}
              </span>
            </div>
            <Progress value={fundingRound.progress.percentage} className="h-2 bg-gray-200" />
          </div>
          
          {/* Interested Investors */}
          {fundingRound.interestedInvestors.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Interested Investors ({fundingRound.interestedInvestors.length})
              </h4>
              <div className="space-y-4">
                {fundingRound.interestedInvestors.map((investor) => {
                  const statusColor = getStatusColor(investor.status);
                  
                  return (
                    <div key={investor.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarImage src={investor.avatar} alt={investor.name} />
                          <AvatarFallback>{investor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <h5 className="text-sm font-medium text-gray-900">{investor.name}</h5>
                          <p className="text-xs text-gray-500">{investor.company}</p>
                        </div>
                        <div className="ml-auto">
                          <Badge variant="outline" className={`${statusColor.bg} ${statusColor.text}`}>
                            {statusColor.icon && <i className={`fas ${statusColor.icon} mr-1`}></i>}
                            {investor.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {investor.offer && (
                        <div className="mt-4 bg-gray-50 rounded p-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Offer:</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(investor.offer.amount)} for {investor.offer.equity}% equity
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500">Valuation:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(investor.offer.valuation)}</span>
                          </div>
                        </div>
                      )}
                      
                      {investor.meetingSchedule && (
                        <div className="mt-4 bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-600">{investor.meetingSchedule}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex space-x-3">
                        {investor.offer ? (
                          <>
                            <Button 
                              className="flex-1"
                              onClick={() => handleOpenAcceptDialog(investor)}
                            >
                              Accept Offer
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleOpenCounterDialog(investor)}
                            >
                              Counter Offer
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" className="w-full">
                            Send Message
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Button>
              Invite More Investors
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Accept Offer Dialog */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Investment Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept the following offer?
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvestor?.offer && (
            <div className="my-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Offer from {selectedInvestor.name}</p>
              <p className="mt-2 text-sm text-gray-500">
                {formatCurrency(selectedInvestor.offer.amount)} for {selectedInvestor.offer.equity}% equity
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Valuation: {formatCurrency(selectedInvestor.offer.valuation)}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAcceptOffer}
              disabled={acceptOfferMutation.isPending}
            >
              {acceptOfferMutation.isPending ? "Processing..." : "Accept Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Counter Offer Dialog */}
      <Dialog open={isCounterDialogOpen} onOpenChange={setIsCounterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Counter Offer</DialogTitle>
            <DialogDescription>
              Send a counter offer to {selectedInvestor?.name}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvestor?.offer && (
            <div className="my-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Original Offer</p>
              <p className="mt-2 text-sm text-gray-500">
                {formatCurrency(selectedInvestor.offer.amount)} for {selectedInvestor.offer.equity}% equity
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Valuation: {formatCurrency(selectedInvestor.offer.valuation)}
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Investment Amount</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  value={counterOffer.amount}
                  onChange={(e) => setCounterOffer({...counterOffer, amount: Number(e.target.value)})}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Equity Percentage</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  value={counterOffer.equity}
                  onChange={(e) => setCounterOffer({...counterOffer, equity: Number(e.target.value)})}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Implied Valuation: {
                formatCurrency(
                  counterOffer.equity > 0 
                    ? (counterOffer.amount / counterOffer.equity) * 100 
                    : 0
                )
              }</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCounterDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCounterOffer}
              disabled={counterOfferMutation.isPending || counterOffer.amount <= 0 || counterOffer.equity <= 0}
            >
              {counterOfferMutation.isPending ? "Sending..." : "Send Counter Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
