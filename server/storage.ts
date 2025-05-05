import { db } from "@db";
import { 
  users,
  startups,
  investors,
  investorPreferences,
  fundingRounds,
  offers,
  pitches,
  pitchRooms,
  pitchRoomMessages,
  feedback,
  capTables,
  categories,
  stages,
  sectors,
  businessModels,
  bookmarks
} from "@shared/schema";
import { eq, and, like, desc, asc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Helper to create consistent error handling
const handleError = (operation: string, error: any) => {
  console.error(`Error in ${operation}:`, error);
  throw new Error(`Failed to ${operation}`);
};

// Storage service for database operations
export const storage = {
  // User operations
  async getCurrentUser() {
    try {
      // In a real application, this would use the session/auth user ID
      // For demo purposes, this returns a mock user
      const user = await db.query.users.findFirst({
        orderBy: asc(users.id)
      });
      
      return user;
    } catch (error) {
      handleError("get current user", error);
    }
  },
  
  async updateUserProfile(userData: any) {
    try {
      // Get the current user ID
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      const [updatedUser] = await db
        .update(users)
        .set({
          name: userData.name,
          email: userData.email,
          bio: userData.bio,
          location: userData.location,
          company: userData.company,
          title: userData.title,
          website: userData.website,
          twitterHandle: userData.twitter,
          linkedinHandle: userData.linkedin,
          updatedAt: new Date()
        })
        .where(eq(users.id, currentUser.id))
        .returning();
      
      return updatedUser;
    } catch (error) {
      handleError("update user profile", error);
    }
  },
  
  // Founder operations
  async getFounderDashboard() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get the founder's startup
      const startup = await db.query.startups.findFirst({
        where: eq(startups.userId, currentUser.id)
      });
      
      if (!startup) {
        throw new Error("Startup not found");
      }
      
      // Get current valuation
      const fundingRound = await db.query.fundingRounds.findFirst({
        where: eq(fundingRounds.startupId, startup.id),
        orderBy: desc(fundingRounds.createdAt)
      });
      
      // Get total funding raised
      const fundingRaised = await db
        .select({
          total: sql<number>`SUM(${offers.amount})`,
          count: sql<number>`COUNT(DISTINCT ${fundingRounds.id})`
        })
        .from(offers)
        .innerJoin(fundingRounds, eq(offers.fundingRoundId, fundingRounds.id))
        .where(
          and(
            eq(fundingRounds.startupId, startup.id),
            eq(offers.status, "accepted")
          )
        )
        .execute()
        .then(result => result[0] || { total: 0, count: 0 });
      
      // Get investor interest count
      const investorInterest = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(offers)
        .innerJoin(fundingRounds, eq(offers.fundingRoundId, fundingRounds.id))
        .where(
          and(
            eq(fundingRounds.startupId, startup.id),
            eq(fundingRounds.status, "active")
          )
        )
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Get new investors in the last 7 days
      const newInvestors = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(offers)
        .innerJoin(fundingRounds, eq(offers.fundingRoundId, fundingRounds.id))
        .where(
          and(
            eq(fundingRounds.startupId, startup.id),
            eq(fundingRounds.status, "active"),
            sql`${offers.createdAt} > NOW() - INTERVAL '7 days'`
          )
        )
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Get average rating
      const ratings = await db
        .select({
          avg: sql<string>`AVG((${feedback.teamRating} + ${feedback.productRating} + ${feedback.marketRating}) / 3)::numeric(10,1)`
        })
        .from(feedback)
        .where(eq(feedback.startupId, startup.id))
        .execute()
        .then(result => result[0]?.avg || "0.0");
      
      return {
        name: currentUser.name,
        currentValuation: fundingRound?.valuation || 0,
        valuationChange: fundingRound?.valuationChange || null,
        fundingRaised: fundingRaised.total || 0,
        fundingRounds: fundingRaised.count || 0,
        investorInterest,
        newInvestors: newInvestors > 0 ? newInvestors : null,
        averageRating: ratings
      };
    } catch (error) {
      handleError("get founder dashboard", error);
    }
  },
  
  async getFounderStartup() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get the founder's startup with related category
      const startup = await db.query.startups.findFirst({
        where: eq(startups.userId, currentUser.id),
        with: {
          category: true
        }
      });
      
      if (!startup) {
        throw new Error("Startup not found");
      }
      
      // Get pitch deck if exists
      const pitchDeck = startup.pitchDeckUrl ? {
        filename: startup.pitchDeckFilename || "pitch_deck.pdf",
        updatedAt: startup.pitchDeckUpdatedAt?.toISOString() || new Date().toISOString(),
        slides: startup.pitchDeckSlides || 12,
        url: startup.pitchDeckUrl
      } : null;
      
      // Calculate profile completion percentage
      const requiredFields = [
        'name', 'tagline', 'description', 'stage', 'categoryId', 
        'location', 'foundedYear', 'teamSize', 'marketSize', 'businessModel'
      ];
      const completedFields = requiredFields.filter(field => !!startup[field as keyof typeof startup]);
      const profileCompletion = Math.round((completedFields.length / requiredFields.length) * 100);
      
      return {
        id: startup.id,
        name: startup.name,
        tagline: startup.tagline,
        logo: startup.logoUrl,
        category: startup.category?.name || "Technology",
        location: startup.location,
        teamSize: startup.teamSize,
        marketSize: startup.marketSize,
        businessModel: startup.businessModel,
        stage: startup.stage,
        pitchDeck,
        profileCompletion
      };
    } catch (error) {
      handleError("get founder startup", error);
    }
  },
  
  async updateStartupProfile(startupData: any) {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get the founder's startup
      const existingStartup = await db.query.startups.findFirst({
        where: eq(startups.userId, currentUser.id)
      });
      
      if (!existingStartup) {
        // Create new startup if it doesn't exist
        const [newStartup] = await db
          .insert(startups)
          .values({
            id: uuidv4(),
            userId: currentUser.id,
            name: startupData.name,
            tagline: startupData.tagline,
            description: startupData.description,
            stage: startupData.stage,
            categoryId: startupData.category,
            location: startupData.location,
            website: startupData.website,
            teamSize: startupData.teamSize,
            foundedYear: startupData.foundedYear,
            marketSize: startupData.marketSize,
            businessModel: startupData.businessModel,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        return newStartup;
      } else {
        // Update existing startup
        const [updatedStartup] = await db
          .update(startups)
          .set({
            name: startupData.name,
            tagline: startupData.tagline,
            description: startupData.description,
            stage: startupData.stage,
            categoryId: startupData.category,
            location: startupData.location,
            website: startupData.website,
            teamSize: startupData.teamSize,
            foundedYear: startupData.foundedYear,
            marketSize: startupData.marketSize,
            businessModel: startupData.businessModel,
            updatedAt: new Date()
          })
          .where(eq(startups.id, existingStartup.id))
          .returning();
        
        return updatedStartup;
      }
    } catch (error) {
      handleError("update startup profile", error);
    }
  },
  
  async getCurrentFundingRound() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get the founder's startup
      const startup = await db.query.startups.findFirst({
        where: eq(startups.userId, currentUser.id)
      });
      
      if (!startup) {
        throw new Error("Startup not found");
      }
      
      // Get active funding round
      const fundingRound = await db.query.fundingRounds.findFirst({
        where: and(
          eq(fundingRounds.startupId, startup.id),
          eq(fundingRounds.status, "active")
        )
      });
      
      if (!fundingRound) {
        // Create a default funding round if none exists
        const newFundingRound = {
          id: uuidv4(),
          startupId: startup.id,
          askAmount: 500000,
          equityOffered: 8,
          status: "active",
          closingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const [createdRound] = await db
          .insert(fundingRounds)
          .values(newFundingRound)
          .returning();
        
        return {
          id: createdRound.id,
          status: "active",
          askAmount: createdRound.askAmount,
          equityOffered: createdRound.equityOffered,
          impliedValuation: (createdRound.askAmount / createdRound.equityOffered) * 100,
          closingDate: createdRound.closingDate.toISOString(),
          progress: {
            raised: 0,
            total: createdRound.askAmount,
            percentage: 0
          },
          interestedInvestors: []
        };
      }
      
      // Calculate valuation
      const impliedValuation = (fundingRound.askAmount / fundingRound.equityOffered) * 100;
      
      // Get offers for this funding round
      const offersData = await db.query.offers.findMany({
        where: eq(offers.fundingRoundId, fundingRound.id),
        with: {
          investor: true
        }
      });
      
      // Calculate funding progress
      const acceptedOffers = offersData.filter(offer => offer.status === "accepted");
      const totalRaised = acceptedOffers.reduce((sum, offer) => sum + offer.amount, 0);
      const progressPercentage = (totalRaised / fundingRound.askAmount) * 100;
      
      // Format interested investors
      const interestedInvestors = offersData.map(offer => {
        let offerData = null;
        
        if (offer.status === "offered" || offer.status === "accepted") {
          offerData = {
            amount: offer.amount,
            equity: offer.equityPercentage,
            valuation: (offer.amount / offer.equityPercentage) * 100
          };
        }
        
        let meetingSchedule = null;
        if (offer.meetingScheduled) {
          meetingSchedule = `Scheduled pitch meeting for ${new Date(offer.meetingScheduled).toLocaleDateString()} at ${new Date(offer.meetingScheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        return {
          id: offer.investor.id,
          name: offer.investor.name,
          company: offer.investor.company,
          avatar: offer.investor.avatar,
          status: offer.status,
          offer: offerData,
          meetingSchedule
        };
      });
      
      return {
        id: fundingRound.id,
        status: fundingRound.status,
        askAmount: fundingRound.askAmount,
        equityOffered: fundingRound.equityOffered,
        impliedValuation,
        closingDate: fundingRound.closingDate.toISOString(),
        progress: {
          raised: totalRaised,
          total: fundingRound.askAmount,
          percentage: progressPercentage
        },
        interestedInvestors
      };
    } catch (error) {
      handleError("get current funding round", error);
    }
  },
  
  async acceptInvestmentOffer(roundId: string, investorId: string) {
    try {
      // Update offer status to accepted
      const [updatedOffer] = await db
        .update(offers)
        .set({
          status: "accepted",
          acceptedAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(offers.fundingRoundId, roundId),
            eq(offers.investorId, investorId)
          )
        )
        .returning();
      
      if (!updatedOffer) {
        throw new Error("Offer not found");
      }
      
      // Update cap table
      const fundingRound = await db.query.fundingRounds.findFirst({
        where: eq(fundingRounds.id, roundId)
      });
      
      if (fundingRound) {
        await db.insert(capTables).values({
          id: uuidv4(),
          startupId: fundingRound.startupId,
          investorId,
          equity: updatedOffer.equityPercentage,
          investment: updatedOffer.amount,
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      return { success: true, offer: updatedOffer };
    } catch (error) {
      handleError("accept investment offer", error);
    }
  },
  
  async submitCounterOffer(roundId: string, investorId: string, amount: number, equity: number) {
    try {
      // Update the existing offer with counter offer
      const [updatedOffer] = await db
        .update(offers)
        .set({
          amount,
          equityPercentage: equity,
          status: "countered",
          updatedAt: new Date()
        })
        .where(
          and(
            eq(offers.fundingRoundId, roundId),
            eq(offers.investorId, investorId)
          )
        )
        .returning();
      
      if (!updatedOffer) {
        throw new Error("Offer not found");
      }
      
      return { success: true, offer: updatedOffer };
    } catch (error) {
      handleError("submit counter offer", error);
    }
  },
  
  async getFounderPitches() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get the founder's startup
      const startup = await db.query.startups.findFirst({
        where: eq(startups.userId, currentUser.id)
      });
      
      if (!startup) {
        throw new Error("Startup not found");
      }
      
      // Get upcoming pitches
      const upcomingPitches = await db.query.pitches.findMany({
        where: eq(pitches.startupId, startup.id),
        orderBy: asc(pitches.scheduledAt)
      });
      
      // Format pitch data
      return upcomingPitches.map(pitch => {
        const scheduledDate = new Date(pitch.scheduledAt);
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        
        let scheduledText;
        if (scheduledDate.toDateString() === now.toDateString()) {
          scheduledText = `Today, ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (scheduledDate.toDateString() === tomorrow.toDateString()) {
          scheduledText = `Tomorrow, ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          scheduledText = `${scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Can join if the pitch is within 15 minutes of scheduled time
        const canJoin = Math.abs(scheduledDate.getTime() - now.getTime()) < 15 * 60 * 1000;
        
        return {
          id: pitch.id,
          title: pitch.title,
          scheduledDate: scheduledText,
          canJoin
        };
      });
    } catch (error) {
      handleError("get founder pitches", error);
    }
  },
  
  async getFounderFeedback() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get the founder's startup
      const startup = await db.query.startups.findFirst({
        where: eq(startups.userId, currentUser.id)
      });
      
      if (!startup) {
        throw new Error("Startup not found");
      }
      
      // Get feedback items
      const feedbackItems = await db.query.feedback.findMany({
        where: eq(feedback.startupId, startup.id),
        orderBy: desc(feedback.createdAt),
        with: {
          investor: true
        },
        limit: 5
      });
      
      // Calculate average ratings
      const ratings = await db
        .select({
          teamAvg: sql<string>`AVG(${feedback.teamRating})::numeric(10,1)`,
          productAvg: sql<string>`AVG(${feedback.productRating})::numeric(10,1)`,
          marketAvg: sql<string>`AVG(${feedback.marketRating})::numeric(10,1)`
        })
        .from(feedback)
        .where(eq(feedback.startupId, startup.id))
        .execute()
        .then(result => result[0] || { teamAvg: "0.0", productAvg: "0.0", marketAvg: "0.0" });
      
      // Format feedback data
      const formattedFeedback = feedbackItems.map(item => {
        // Calculate days ago
        const daysAgo = Math.round(
          (new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        let dateText;
        if (daysAgo === 0) {
          dateText = "Today";
        } else if (daysAgo === 1) {
          dateText = "Yesterday";
        } else {
          dateText = `${daysAgo} days ago`;
        }
        
        return {
          id: item.id,
          investor: {
            id: item.investor.id,
            name: item.investor.name,
            avatar: item.investor.avatar
          },
          date: dateText,
          comment: item.comment
        };
      });
      
      return {
        ratings: {
          team: ratings.teamAvg,
          product: ratings.productAvg,
          market: ratings.marketAvg
        },
        items: formattedFeedback
      };
    } catch (error) {
      handleError("get founder feedback", error);
    }
  },
  
  async getCapTable() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get the founder's startup
      const startup = await db.query.startups.findFirst({
        where: eq(startups.userId, currentUser.id)
      });
      
      if (!startup) {
        throw new Error("Startup not found");
      }
      
      // Get cap table entries
      const capTableEntries = await db.query.capTables.findMany({
        where: eq(capTables.startupId, startup.id)
      });
      
      // Calculate percentages
      const investorEquity = capTableEntries.reduce((sum, entry) => sum + entry.equity, 0);
      
      // Default cap table with standard percentages if no investments yet
      const shareholders = [
        {
          type: "Founders",
          percentage: 100 - investorEquity - 15, // Assuming 15% is option pool
          color: "#3B82F6" // primary-500
        },
        {
          type: "Investors",
          percentage: investorEquity,
          color: "#8B5CF6" // accent-500
        },
        {
          type: "Option Pool",
          percentage: 15,
          color: "#E5E7EB" // gray-200
        }
      ];
      
      return { shareholders };
    } catch (error) {
      handleError("get cap table", error);
    }
  },
  
  // Investor operations
  async getInvestorDashboard() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get or create investor record
      let investor = await db.query.investors.findFirst({
        where: eq(investors.userId, currentUser.id)
      });
      
      if (!investor) {
        // Create default investor record
        const [newInvestor] = await db
          .insert(investors)
          .values({
            id: uuidv4(),
            userId: currentUser.id,
            name: currentUser.name,
            company: "Angel Investor",
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        investor = newInvestor;
      }
      
      // Get portfolio value
      const portfolioValue = await db
        .select({
          invested: sql<number>`SUM(${capTables.investment})`,
          value: sql<number>`SUM(${capTables.investment} * 1.4)` // Simplified calculation
        })
        .from(capTables)
        .where(eq(capTables.investorId, investor.id))
        .execute()
        .then(result => result[0] || { invested: 0, value: 0 });
      
      // Get investments count
      const investmentsCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(capTables)
        .where(eq(capTables.investorId, investor.id))
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Get new pitches count
      const newPitchesCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pitches)
        .where(sql`${pitches.createdAt} > NOW() - INTERVAL '7 days'`)
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Get today's new pitches
      const todayPitches = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pitches)
        .where(sql`DATE(${pitches.createdAt}) = CURRENT_DATE`)
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Get upcoming pitches
      const upcomingPitches = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pitches)
        .where(sql`${pitches.scheduledAt} > NOW() AND ${pitches.scheduledAt} < NOW() + INTERVAL '7 days'`)
        .execute()
        .then(result => result[0]?.count || 0);
      
      return {
        name: currentUser.name,
        portfolioValue: portfolioValue.value || 0,
        portfolioGrowth: "8%", // Simplified
        investments: investmentsCount,
        newPitches: newPitchesCount,
        todayPitches: todayPitches > 0 ? todayPitches : null,
        upcomingPitches
      };
    } catch (error) {
      handleError("get investor dashboard", error);
    }
  },
  
  async getStartupsForInvestor() {
    try {
      // Get startups looking for funding
      const startupsList = await db.query.startups.findMany({
        with: {
          category: true,
          fundingRounds: {
            where: eq(fundingRounds.status, "active")
          }
        },
        limit: 6 // Limit to a reasonable number for display
      });
      
      // Get current user for bookmark status
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get investor record
      const investor = await db.query.investors.findFirst({
        where: eq(investors.userId, currentUser.id)
      });
      
      if (!investor) {
        throw new Error("Investor not found");
      }
      
      // Get bookmarked startups
      const bookmarkedStartups = await db.query.bookmarks.findMany({
        where: eq(bookmarks.investorId, investor.id)
      });
      
      const bookmarkedIds = new Set(bookmarkedStartups.map(bookmark => bookmark.startupId));
      
      // Map startups to desired format
      return startupsList
        .filter(startup => startup.fundingRounds.length > 0)
        .map(startup => {
          const fundingRound = startup.fundingRounds[0];
          const valuation = (fundingRound.askAmount / fundingRound.equityOffered) * 100;
          
          // Determine icon based on category
          let icon = "fa-code";
          let iconColor = "gray-500";
          
          if (startup.category) {
            switch (startup.category.name.toLowerCase()) {
              case "saas":
              case "software":
                icon = "fa-code";
                iconColor = "gray-500";
                break;
              case "healthcare":
              case "biotech":
                icon = "fa-heartbeat";
                iconColor = "red-500";
                break;
              case "fintech":
                icon = "fa-dollar-sign";
                iconColor = "green-500";
                break;
              case "edtech":
                icon = "fa-graduation-cap";
                iconColor = "blue-500";
                break;
              case "cleantech":
              case "sustainability":
                icon = "fa-leaf";
                iconColor = "green-500";
                break;
              case "e-commerce":
              case "retail":
                icon = "fa-shopping-bag";
                iconColor = "purple-500";
                break;
              default:
                icon = "fa-building";
                iconColor = "gray-500";
            }
          }
          
          return {
            id: startup.id,
            name: startup.name,
            category: startup.category?.name || "Technology",
            stage: startup.stage || "Seed",
            description: startup.description || "",
            icon,
            iconColor,
            ask: {
              amount: fundingRound.askAmount,
              equity: fundingRound.equityOffered,
              valuation
            },
            bookmarked: bookmarkedIds.has(startup.id)
          };
        });
    } catch (error) {
      handleError("get startups for investor", error);
    }
  },
  
  async toggleStartupBookmark(startupId: string, bookmarked: boolean) {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get investor record
      const investor = await db.query.investors.findFirst({
        where: eq(investors.userId, currentUser.id)
      });
      
      if (!investor) {
        throw new Error("Investor not found");
      }
      
      if (bookmarked) {
        // Create bookmark
        await db.insert(bookmarks).values({
          id: uuidv4(),
          investorId: investor.id,
          startupId,
          createdAt: new Date()
        });
      } else {
        // Remove bookmark
        await db
          .delete(bookmarks)
          .where(
            and(
              eq(bookmarks.investorId, investor.id),
              eq(bookmarks.startupId, startupId)
            )
          );
      }
      
      return { success: true, bookmarked };
    } catch (error) {
      handleError("toggle startup bookmark", error);
    }
  },
  
  async getInvestorPortfolio() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get investor record
      const investor = await db.query.investors.findFirst({
        where: eq(investors.userId, currentUser.id)
      });
      
      if (!investor) {
        throw new Error("Investor not found");
      }
      
      // Get portfolio investments
      const investments = await db.query.capTables.findMany({
        where: eq(capTables.investorId, investor.id),
        orderBy: asc(capTables.date)
      });
      
      // Calculate portfolio metrics
      const totalInvested = investments.reduce((sum, inv) => sum + inv.investment, 0);
      const currentValue = investments.reduce((sum, inv) => sum + (inv.investment * 1.4), 0); // Simplified calculation
      const roi = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
      
      // Generate monthly values (simplified)
      const monthlyValues = [
        { month: "Jan", value: totalInvested * 0.9 },
        { month: "Feb", value: totalInvested * 0.95 },
        { month: "Mar", value: totalInvested * 1.0 },
        { month: "Apr", value: totalInvested * 1.05 },
        { month: "May", value: totalInvested * 1.15 },
        { month: "Jun", value: totalInvested * 1.2 },
        { month: "Jul", value: totalInvested * 1.3 },
        { month: "Aug", value: currentValue }
      ];
      
      return {
        monthlyValues,
        totalInvested,
        currentValue,
        roi: Math.round(roi * 10) / 10,
        startupsFunded: investments.length
      };
    } catch (error) {
      handleError("get investor portfolio", error);
    }
  },
  
  async getInvestorPitches() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get investor record
      const investor = await db.query.investors.findFirst({
        where: eq(investors.userId, currentUser.id)
      });
      
      if (!investor) {
        throw new Error("Investor not found");
      }
      
      // Get upcoming pitches
      const upcomingPitches = await db.query.pitches.findMany({
        where: sql`${pitches.scheduledAt} > NOW()`,
        orderBy: asc(pitches.scheduledAt),
        with: {
          startup: true
        },
        limit: 3
      });
      
      // Format pitch data
      return upcomingPitches.map(pitch => {
        const scheduledDate = new Date(pitch.scheduledAt);
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        
        let scheduledText;
        if (scheduledDate.toDateString() === now.toDateString()) {
          scheduledText = `Today, ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (scheduledDate.toDateString() === tomorrow.toDateString()) {
          scheduledText = `Tomorrow, ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          scheduledText = `${scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Determine icon based on startup name
        let icon = "fa-code";
        let iconColor = "gray-500";
        
        if (pitch.startup.name.toLowerCase().includes("code") || 
            pitch.startup.name.toLowerCase().includes("tech") ||
            pitch.startup.name.toLowerCase().includes("ai")) {
          icon = "fa-code";
          iconColor = "gray-500";
        } else if (pitch.startup.name.toLowerCase().includes("eco") || 
                  pitch.startup.name.toLowerCase().includes("green") ||
                  pitch.startup.name.toLowerCase().includes("earth")) {
          icon = "fa-leaf";
          iconColor = "green-500";
        } else if (pitch.startup.name.toLowerCase().includes("shop") || 
                  pitch.startup.name.toLowerCase().includes("market") ||
                  pitch.startup.name.toLowerCase().includes("store")) {
          icon = "fa-shopping-bag";
          iconColor = "purple-500";
        }
        
        // Can join if the pitch is within 15 minutes of scheduled time
        const canJoin = Math.abs(scheduledDate.getTime() - now.getTime()) < 15 * 60 * 1000;
        
        return {
          id: pitch.id,
          startup: {
            id: pitch.startup.id,
            name: pitch.startup.name,
            icon,
            iconColor
          },
          scheduledDate: scheduledText,
          duration: pitch.duration || 30,
          canJoin,
          action: canJoin ? "Join" : "View Details"
        };
      });
    } catch (error) {
      handleError("get investor pitches", error);
    }
  },
  
  // Startups listing
  async getStartups(filters: { search?: string; category?: string; stage?: string }) {
    try {
      const { search, category, stage } = filters;
      
      // Build query
      let query = db.query.startups.findMany({
        with: {
          category: true,
          fundingRounds: {
            where: eq(fundingRounds.status, "active")
          }
        }
      });
      
      // Filter by search term
      if (search) {
        query = db.query.startups.findMany({
          where: sql`${startups.name} ILIKE ${`%${search}%`} OR ${startups.description} ILIKE ${`%${search}%`}`,
          with: {
            category: true,
            fundingRounds: {
              where: eq(fundingRounds.status, "active")
            }
          }
        });
      }
      
      // Fetch results
      const results = await query;
      
      // Apply additional filters in memory
      let filteredResults = results;
      
      if (category && category !== "all") {
        filteredResults = filteredResults.filter(
          startup => startup.categoryId === category
        );
      }
      
      if (stage && stage !== "all") {
        filteredResults = filteredResults.filter(
          startup => startup.stage === stage
        );
      }
      
      // Filter to only those with active funding rounds
      filteredResults = filteredResults.filter(
        startup => startup.fundingRounds.length > 0
      );
      
      // Get current user for bookmark status
      const currentUser = await this.getCurrentUser();
      let bookmarkedIds = new Set<string>();
      
      if (currentUser) {
        const investor = await db.query.investors.findFirst({
          where: eq(investors.userId, currentUser.id)
        });
        
        if (investor) {
          const bookmarks = await db.query.bookmarks.findMany({
            where: eq(bookmarks.investorId, investor.id)
          });
          
          bookmarkedIds = new Set(bookmarks.map(bm => bm.startupId));
        }
      }
      
      // Format for response
      const startupsList = filteredResults.map(startup => {
        const fundingRound = startup.fundingRounds[0];
        const valuation = fundingRound ? (fundingRound.askAmount / fundingRound.equityOffered) * 100 : 0;
        
        // Determine icon based on category
        let icon = "fa-code";
        let iconColor = "gray-500";
        
        if (startup.category) {
          switch (startup.category.name.toLowerCase()) {
            case "saas":
            case "software":
              icon = "fa-code";
              iconColor = "gray-500";
              break;
            case "healthcare":
            case "biotech":
              icon = "fa-heartbeat";
              iconColor = "red-500";
              break;
            case "fintech":
              icon = "fa-dollar-sign";
              iconColor = "green-500";
              break;
            case "edtech":
              icon = "fa-graduation-cap";
              iconColor = "blue-500";
              break;
            case "cleantech":
            case "sustainability":
              icon = "fa-leaf";
              iconColor = "green-500";
              break;
            case "e-commerce":
            case "retail":
              icon = "fa-shopping-bag";
              iconColor = "purple-500";
              break;
            default:
              icon = "fa-building";
              iconColor = "gray-500";
          }
        }
        
        return {
          id: startup.id,
          name: startup.name,
          category: startup.category?.name || "Technology",
          stage: startup.stage || "Seed",
          description: startup.description || "",
          icon,
          iconColor,
          ask: fundingRound ? {
            amount: fundingRound.askAmount,
            equity: fundingRound.equityOffered,
            valuation
          } : null,
          bookmarked: bookmarkedIds.has(startup.id)
        };
      });
      
      // Simple pagination
      const startIndex = 0;
      const endIndex = startupsList.length;
      const currentPage = 1;
      const totalPages = 1;
      
      return {
        startups: startupsList,
        pagination: {
          totalCount: startupsList.length,
          totalPages,
          currentPage,
          hasMore: currentPage < totalPages
        }
      };
    } catch (error) {
      handleError("get startups", error);
    }
  },
  
  // Investors listing
  async getInvestors(filters: { search?: string; sector?: string; stage?: string }) {
    try {
      const { search, sector, stage } = filters;
      
      // Fetch investors
      let investorsList = await db.query.investors.findMany({
        with: {
          preferences: {
            with: {
              sectors: true,
              stages: true
            }
          }
        }
      });
      
      // Apply search filter in memory
      if (search) {
        const searchLower = search.toLowerCase();
        investorsList = investorsList.filter(
          investor => 
            investor.name.toLowerCase().includes(searchLower) ||
            investor.company.toLowerCase().includes(searchLower) ||
            investor.bio?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sector filter
      if (sector && sector !== "all") {
        investorsList = investorsList.filter(
          investor => investor.preferences?.sectors.some(s => s.id === sector)
        );
      }
      
      // Apply stage filter
      if (stage && stage !== "all") {
        investorsList = investorsList.filter(
          investor => investor.preferences?.stages.some(s => s.id === stage)
        );
      }
      
      // Get portfolio stats
      const portfolioStats = new Map<string, { count: number; totalInvested: number }>();
      
      for (const investor of investorsList) {
        const investments = await db.query.capTables.findMany({
          where: eq(capTables.investorId, investor.id)
        });
        
        portfolioStats.set(investor.id, {
          count: investments.length,
          totalInvested: investments.reduce((sum, inv) => sum + inv.investment, 0)
        });
      }
      
      // Format for response
      const formattedInvestors = investorsList.map(investor => {
        const portfolio = portfolioStats.get(investor.id) || { count: 0, totalInvested: 0 };
        
        // Determine availability status
        let availability = "Available for pitches";
        if (investor.availabilityStatus) {
          availability = investor.availabilityStatus;
        } else if (portfolio.count > 10) {
          availability = "Limited availability";
        }
        
        return {
          id: investor.id,
          name: investor.name,
          company: investor.company,
          avatar: investor.avatar,
          bio: investor.bio || "Experienced investor looking for promising startups.",
          investmentPreferences: {
            sectors: investor.preferences?.sectors.map(s => s.name) || ["Technology", "Software"],
            stages: investor.preferences?.stages.map(s => s.name) || ["Seed", "Series A"]
          },
          portfolio,
          availability
        };
      });
      
      // Simple pagination
      const startIndex = 0;
      const endIndex = formattedInvestors.length;
      const currentPage = 1;
      const totalPages = 1;
      
      return {
        investors: formattedInvestors,
        pagination: {
          totalCount: formattedInvestors.length,
          totalPages,
          currentPage,
          hasMore: currentPage < totalPages
        }
      };
    } catch (error) {
      handleError("get investors", error);
    }
  },
  
  // Pitch Rooms
  async getPitchRooms() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get pitch rooms based on role
      let rooms;
      if (currentUser.role === "founder") {
        // Get founder's startup
        const startup = await db.query.startups.findFirst({
          where: eq(startups.userId, currentUser.id)
        });
        
        if (!startup) {
          return [];
        }
        
        // Get pitch rooms for this startup
        rooms = await db.query.pitchRooms.findMany({
          where: eq(pitchRooms.startupId, startup.id),
          orderBy: desc(pitchRooms.updatedAt)
        });
      } else {
        // Get investor record
        const investor = await db.query.investors.findFirst({
          where: eq(investors.userId, currentUser.id)
        });
        
        if (!investor) {
          return [];
        }
        
        // Get pitch rooms for this investor
        rooms = await db.query.pitchRooms.findMany({
          where: eq(pitchRooms.investorId, investor.id),
          orderBy: desc(pitchRooms.updatedAt)
        });
      }
      
      // Format for response
      return rooms.map(room => {
        const scheduledDate = new Date(room.scheduledAt);
        const now = new Date();
        
        let status = "scheduled";
        if (scheduledDate < now && (now.getTime() - scheduledDate.getTime()) < 24 * 60 * 60 * 1000) {
          status = "active";
        } else if (scheduledDate < now) {
          status = "completed";
        }
        
        const scheduledText = scheduledDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
        
        return {
          id: room.id,
          name: room.name,
          avatarUrl: room.avatarUrl,
          scheduledFor: scheduledText,
          status
        };
      });
    } catch (error) {
      handleError("get pitch rooms", error);
    }
  },
  
  async getPitchRoomById(id: string) {
    try {
      const room = await db.query.pitchRooms.findFirst({
        where: eq(pitchRooms.id, id),
        with: {
          startup: true,
          investor: true
        }
      });
      
      if (!room) {
        return null;
      }
      
      // Get the current user
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Get pitch deck data
      const pitchDeck = {
        id: "pd-" + room.id,
        name: room.name + " Pitch Deck",
        totalSlides: 10,
        downloadUrl: room.pitchDeckUrl || "#",
        slides: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          imageUrl: `https://placehold.co/800x450?text=Slide+${i + 1}`
        }))
      };
      
      // Determine if user is founder or investor
      const userRole = currentUser.role || (
        room.startup?.userId === currentUser.id ? "founder" : "investor"
      );
      
      return {
        id: room.id,
        name: room.name,
        description: room.description || `Pitch session for ${room.name}`,
        pitchDeck,
        currentUser: {
          id: currentUser.id,
          role: userRole
        }
      };
    } catch (error) {
      handleError("get pitch room by id", error);
    }
  },
  
  async savePitchRoomMessage(roomId: string, senderId: string, content: string) {
    try {
      // Get user info
      const user = await db.query.users.findFirst({
        where: eq(users.id, senderId)
      });
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // Get pitch room
      const room = await db.query.pitchRooms.findFirst({
        where: eq(pitchRooms.id, roomId)
      });
      
      if (!room) {
        throw new Error("Pitch room not found");
      }
      
      // Determine user role
      const isFounder = room.startupUserId === user.id;
      
      // Save message
      const [savedMessage] = await db
        .insert(pitchRoomMessages)
        .values({
          id: uuidv4(),
          pitchRoomId: roomId,
          senderId,
          content,
          createdAt: new Date()
        })
        .returning();
      
      // Return formatted message
      return {
        id: savedMessage.id,
        senderId,
        senderName: user.name,
        senderAvatar: user.avatar,
        senderRole: isFounder ? "founder" : "investor",
        content: savedMessage.content,
        timestamp: savedMessage.createdAt.toISOString()
      };
    } catch (error) {
      handleError("save pitch room message", error);
    }
  },
  
  // Leaderboard
  async getLeaderboard(filters: { timeRange?: string; category?: string }) {
    try {
      const { timeRange, category } = filters;
      
      // Determine date range filter
      let dateFilter = sql`TRUE`;
      if (timeRange === "this_month") {
        dateFilter = sql`${fundingRounds.updatedAt} >= DATE_TRUNC('month', CURRENT_DATE)`;
      } else if (timeRange === "this_year") {
        dateFilter = sql`${fundingRounds.updatedAt} >= DATE_TRUNC('year', CURRENT_DATE)`;
      }
      
      // Get startups with funding data
      const startups = await db.query.startups.findMany({
        with: {
          category: true,
          fundingRounds: {
            where: dateFilter
          }
        },
        orderBy: desc(startups.updatedAt)
      });
      
      // Calculate metrics for each startup
      const startupMetrics = startups.map(startup => {
        // Calculate valuation from latest funding round
        const latestRound = startup.fundingRounds
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
        
        const valuation = latestRound 
          ? (latestRound.askAmount / latestRound.equityOffered) * 100
          : 0;
        
        // Calculate total funding raised
        const fundingRaised = startup.fundingRounds.reduce((sum, round) => {
          const acceptedOffers = round.acceptedOffers || 0;
          return sum + acceptedOffers;
        }, 0);
        
        // Determine investor interest score
        const investorInterest = startup.fundingRounds.reduce((sum, round) => {
          const offersCount = round.offersCount || 0;
          return sum + offersCount;
        }, 0);
        
        // Random change for demo purposes
        const change = Math.floor(Math.random() * 11) - 3; // -3 to +7
        
        return {
          id: startup.id,
          name: startup.name,
          logo: startup.logoUrl,
          category: startup.category?.name || "Technology",
          valuation,
          fundingRaised,
          investorInterest,
          change
        };
      });
      
      // Apply category filter if needed
      let filteredStartups = startupMetrics;
      if (category !== "all") {
        if (category === "valuation") {
          filteredStartups = filteredStartups
            .filter(s => s.valuation > 0)
            .sort((a, b) => b.valuation - a.valuation);
        } else if (category === "funding") {
          filteredStartups = filteredStartups
            .filter(s => s.fundingRaised > 0)
            .sort((a, b) => b.fundingRaised - a.fundingRaised);
        } else if (category === "investor_interest") {
          filteredStartups = filteredStartups
            .filter(s => s.investorInterest > 0)
            .sort((a, b) => b.investorInterest - a.investorInterest);
        }
      }
      
      // Get top investors
      const investors = await db.query.investors.findMany({
        orderBy: desc(investors.createdAt),
        limit: 10
      });
      
      // Calculate metrics for each investor
      const investorMetrics = await Promise.all(
        investors.map(async (investor) => {
          // Get investments
          const investments = await db.query.capTables.findMany({
            where: eq(capTables.investorId, investor.id)
          });
          
          // Calculate portfolio value (simplified)
          const portfolioValue = investments.reduce((sum, inv) => sum + (inv.investment * 1.4), 0);
          
          // Random success rate for demo
          const successRate = 70 + Math.floor(Math.random() * 25);
          
          return {
            id: investor.id,
            name: investor.name,
            avatar: investor.avatar,
            company: investor.company,
            portfolioValue,
            investments: investments.length,
            successRate
          };
        })
      );
      
      // Sort investors by portfolio value
      const sortedInvestors = investorMetrics
        .sort((a, b) => b.portfolioValue - a.portfolioValue);
      
      return {
        startups: filteredStartups.slice(0, 10),
        investors: sortedInvestors.slice(0, 5)
      };
    } catch (error) {
      handleError("get leaderboard", error);
    }
  },
  
  // Reference data
  async getCategories() {
    try {
      return db.query.categories.findMany({
        orderBy: asc(categories.name)
      });
    } catch (error) {
      handleError("get categories", error);
    }
  },
  
  async getStages() {
    try {
      return db.query.stages.findMany({
        orderBy: asc(stages.sortOrder)
      });
    } catch (error) {
      handleError("get stages", error);
    }
  },
  
  async getSectors() {
    try {
      return db.query.sectors.findMany({
        orderBy: asc(sectors.name)
      });
    } catch (error) {
      handleError("get sectors", error);
    }
  },
  
  async getBusinessModels() {
    try {
      return db.query.businessModels.findMany({
        orderBy: asc(businessModels.name)
      });
    } catch (error) {
      handleError("get business models", error);
    }
  }
};
