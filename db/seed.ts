import { db } from "./index";
import { users } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

async function seed() {
  try {
    // First check if data already exists to avoid duplicating
    const existingUsersCount = await db.select({ count: { value: "count(*)" } }).from(users);
    
    if (existingUsersCount[0].count.value > 0) {
      console.log("Database already has data. Skipping seed.");
      return;
    }
    
    console.log("Seeding database with minimal data...");
    
    // Create a test user
    const password = await bcrypt.hash("password123", 10);
    
    const userData = {
      id: uuidv4(),
      username: "testuser",
      password: password,
      name: "Test User",
      email: "test@example.com",
      role: "founder",
      bio: "Test bio",
      location: "Test Location",
      title: "CEO & Founder",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [insertedUser] = await db.insert(users).values(userData).returning();
    
    console.log("Inserted test user:", insertedUser.name);
    
    // Stages
    const stagesData = [
      { name: "Idea", description: "Initial concept stage", sortOrder: 1 },
      { name: "Pre-seed", description: "Early development with minimal funding", sortOrder: 2 },
      { name: "Seed", description: "Product development and initial traction", sortOrder: 3 },
      { name: "Series A", description: "Established product with proven traction", sortOrder: 4 },
      { name: "Series B", description: "Scaling and expanding operations", sortOrder: 5 },
      { name: "Series C+", description: "Large-scale expansion and growth", sortOrder: 6 }
    ];
    
    const insertedStages = await db.insert(stages).values(
      stagesData.map(stage => ({
        id: uuidv4(),
        name: stage.name,
        description: stage.description,
        sortOrder: stage.sortOrder,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedStages.length} stages`);
    
    // Sectors
    const sectorsData = [
      { name: "Technology" },
      { name: "Finance" },
      { name: "Healthcare" },
      { name: "Education" },
      { name: "Retail" },
      { name: "Manufacturing" },
      { name: "Energy" },
      { name: "Transportation" }
    ];
    
    const insertedSectors = await db.insert(sectors).values(
      sectorsData.map(sector => ({
        id: uuidv4(),
        name: sector.name,
        description: sector.name + " sector",
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedSectors.length} sectors`);
    
    // Business Models
    const businessModelsData = [
      { name: "Subscription", description: "Recurring payment model" },
      { name: "Freemium", description: "Basic features free, premium features paid" },
      { name: "Marketplace", description: "Platform connecting buyers and sellers" },
      { name: "E-commerce", description: "Online sales of products" },
      { name: "Advertising", description: "Revenue from ads shown to users" },
      { name: "Usage-based", description: "Pay-as-you-go model" },
      { name: "License", description: "One-time payment for usage rights" }
    ];
    
    const insertedBusinessModels = await db.insert(businessModels).values(
      businessModelsData.map(model => ({
        id: uuidv4(),
        name: model.name,
        description: model.description,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedBusinessModels.length} business models`);
    
    // Users - Founders
    const founderPassword = await bcrypt.hash("password123", 10);
    
    const foundersData = [
      {
        username: "alexchen",
        password: founderPassword,
        name: "Alex Chen",
        email: "alex@techvision.com",
        role: "founder",
        bio: "Serial entrepreneur with 10+ years in AI and computer vision",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        location: "San Francisco, CA",
        title: "CEO & Founder"
      },
      {
        username: "sarahjohnson",
        password: founderPassword,
        name: "Sarah Johnson",
        email: "sarah@ecotrack.io",
        role: "founder",
        bio: "Passionate about sustainable technology and reducing carbon footprints",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        location: "Austin, TX",
        title: "CEO & Co-founder"
      },
      {
        username: "michaelwong",
        password: founderPassword,
        name: "Michael Wong",
        email: "michael@shoplocal.com",
        role: "founder",
        bio: "Building the bridge between local artisans and global consumers",
        avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        location: "New York, NY",
        title: "CEO & Founder"
      }
    ];
    
    const insertedFounders = await db.insert(users).values(
      foundersData.map(founder => ({
        id: uuidv4(),
        username: founder.username,
        password: founder.password,
        name: founder.name,
        email: founder.email,
        role: founder.role,
        bio: founder.bio,
        avatar: founder.avatar,
        location: founder.location,
        title: founder.title,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedFounders.length} founders`);
    
    // Users - Investors
    const investorPassword = await bcrypt.hash("password123", 10);
    
    const investorsData = [
      {
        username: "robertlee",
        password: investorPassword,
        name: "Robert Lee",
        email: "robert@venturefund.com",
        role: "investor",
        bio: "Venture capitalist with focus on early-stage tech startups",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        location: "San Francisco, CA",
        company: "Venture Fund Capital",
        title: "Managing Partner"
      },
      {
        username: "emilyzhao",
        password: investorPassword,
        name: "Emily Zhao",
        email: "emily@futurefund.com",
        role: "investor",
        bio: "Investing in revolutionary ideas that shape the future",
        avatar: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        location: "Boston, MA",
        company: "Future Fund",
        title: "Investment Director"
      },
      {
        username: "markjensen",
        password: investorPassword,
        name: "Mark Jensen",
        email: "mark@horizonventures.com",
        role: "investor",
        bio: "Angel investor with successful exits in SaaS and fintech",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        location: "New York, NY",
        company: "Horizon Ventures",
        title: "Angel Investor"
      }
    ];
    
    const insertedInvestors = await db.insert(users).values(
      investorsData.map(investor => ({
        id: uuidv4(),
        username: investor.username,
        password: investor.password,
        name: investor.name,
        email: investor.email,
        role: investor.role,
        bio: investor.bio,
        avatar: investor.avatar,
        location: investor.location,
        company: investor.company,
        title: investor.title,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedInvestors.length} investors`);
    
    // Startups
    const saasCategory = insertedCategories.find(c => c.name === "SaaS");
    const cleanTechCategory = insertedCategories.find(c => c.name === "CleanTech");
    const ecommerceCategory = insertedCategories.find(c => c.name === "E-commerce");
    
    const seedStage = insertedStages.find(s => s.name === "Seed");
    
    const startupData = [
      {
        founderId: insertedFounders[0].id,
        name: "TechVision AI",
        tagline: "AI-powered visual recognition platform for automated inventory management in retail stores.",
        description: "TechVision AI uses computer vision and machine learning to help retail stores automate inventory tracking, reducing costs and improving accuracy. Our platform can identify products, track stock levels, and predict restocking needs in real-time.",
        stage: seedStage?.id || "Seed",
        categoryId: saasCategory?.id,
        location: "San Francisco, CA",
        teamSize: 5,
        foundedYear: 2022,
        marketSize: "$4.8B",
        businessModel: "Subscription"
      },
      {
        founderId: insertedFounders[1].id,
        name: "EcoTrack",
        tagline: "IoT platform for monitoring and reducing carbon footprint in commercial buildings.",
        description: "EcoTrack combines IoT sensors and AI analytics to help commercial buildings reduce energy consumption and carbon emissions. Our dashboard provides real-time insights and actionable recommendations for sustainable operations.",
        stage: seedStage?.id || "Seed",
        categoryId: cleanTechCategory?.id,
        location: "Austin, TX",
        teamSize: 8,
        foundedYear: 2021,
        marketSize: "$7.2B",
        businessModel: "SaaS + Hardware"
      },
      {
        founderId: insertedFounders[2].id,
        name: "ShopLocal",
        tagline: "Marketplace app connecting consumers with local artisans and small businesses.",
        description: "ShopLocal is a curated marketplace that helps consumers discover and buy products from local artisans and small businesses. We provide tools for vendors to showcase their products and connect with customers who value locally-made items.",
        stage: seedStage?.id || "Seed",
        categoryId: ecommerceCategory?.id,
        location: "New York, NY",
        teamSize: 7,
        foundedYear: 2022,
        marketSize: "$6.5B",
        businessModel: "Marketplace"
      }
    ];
    
    const insertedStartups = await db.insert(startups).values(
      startupData.map(startup => ({
        id: uuidv4(),
        userId: startup.founderId,
        name: startup.name,
        tagline: startup.tagline,
        description: startup.description,
        stage: startup.stage,
        categoryId: startup.categoryId,
        location: startup.location,
        teamSize: startup.teamSize,
        foundedYear: startup.foundedYear,
        marketSize: startup.marketSize,
        businessModel: startup.businessModel,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedStartups.length} startups`);
    
    // Investor profiles
    const investorProfilesData = [
      {
        userId: insertedInvestors[0].id,
        name: "Robert Lee",
        company: "Venture Fund Capital",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        bio: "Venture capitalist with focus on early-stage tech startups",
        availabilityStatus: "Available for pitches"
      },
      {
        userId: insertedInvestors[1].id,
        name: "Emily Zhao",
        company: "Future Fund",
        avatar: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        bio: "Investing in revolutionary ideas that shape the future",
        availabilityStatus: "Limited availability"
      },
      {
        userId: insertedInvestors[2].id,
        name: "Mark Jensen",
        company: "Horizon Ventures",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        bio: "Angel investor with successful exits in SaaS and fintech",
        availabilityStatus: "Available for pitches"
      }
    ];
    
    const insertedInvestorProfiles = await db.insert(investors).values(
      investorProfilesData.map(profile => ({
        id: uuidv4(),
        userId: profile.userId,
        name: profile.name,
        company: profile.company,
        avatar: profile.avatar,
        bio: profile.bio,
        availabilityStatus: profile.availabilityStatus,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedInvestorProfiles.length} investor profiles`);
    
    // Investor preferences
    for (const investorProfile of insertedInvestorProfiles) {
      const preferenceId = uuidv4();
      
      await db.insert(investorPreferences).values({
        id: preferenceId,
        investorId: investorProfile.id,
        minInvestment: 100000, // $100K
        maxInvestment: 1000000, // $1M
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add some sectors for each investor
      const sectorSample = insertedSectors.slice(0, 3);
      await db.insert(investorPreferencesSectors).values(
        sectorSample.map(sector => ({
          id: uuidv4(),
          preferenceId,
          sectorId: sector.id,
          createdAt: new Date()
        }))
      );
      
      // Add some stages for each investor
      const stageSample = insertedStages.slice(1, 4);
      await db.insert(investorPreferencesStages).values(
        stageSample.map(stage => ({
          id: uuidv4(),
          preferenceId,
          stageId: stage.id,
          createdAt: new Date()
        }))
      );
    }
    
    console.log("Inserted investor preferences");
    
    // Funding rounds
    const fundingRoundsData = [
      {
        startupId: insertedStartups[0].id,
        askAmount: 500000, // $500K
        equityOffered: 8, // 8%
        valuation: 6250000, // $6.25M
        status: "active",
        closingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      {
        startupId: insertedStartups[1].id,
        askAmount: 750000, // $750K
        equityOffered: 12, // 12%
        valuation: 6250000, // $6.25M
        status: "active",
        closingDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
      },
      {
        startupId: insertedStartups[2].id,
        askAmount: 500000, // $500K
        equityOffered: 8, // 8%
        valuation: 6250000, // $6.25M
        status: "active",
        closingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      }
    ];
    
    const insertedFundingRounds = await db.insert(fundingRounds).values(
      fundingRoundsData.map(round => ({
        id: uuidv4(),
        startupId: round.startupId,
        askAmount: round.askAmount,
        equityOffered: round.equityOffered,
        valuation: round.valuation,
        status: round.status,
        closingDate: round.closingDate,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedFundingRounds.length} funding rounds`);
    
    // Investment offers
    const offersData = [
      {
        fundingRoundId: insertedFundingRounds[0].id,
        investorId: insertedInvestorProfiles[0].id,
        amount: 150000, // $150K
        equityPercentage: 7, // 7%
        status: "offered"
      },
      {
        fundingRoundId: insertedFundingRounds[0].id,
        investorId: insertedInvestorProfiles[1].id,
        amount: 0, // No offer yet
        equityPercentage: 0,
        status: "reviewing",
        meetingScheduled: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // Tomorrow
      },
      {
        fundingRoundId: insertedFundingRounds[1].id,
        investorId: insertedInvestorProfiles[2].id,
        amount: 200000, // $200K
        equityPercentage: 8, // 8%
        status: "offered"
      }
    ];
    
    const insertedOffers = await db.insert(offers).values(
      offersData.map(offer => ({
        id: uuidv4(),
        fundingRoundId: offer.fundingRoundId,
        investorId: offer.investorId,
        amount: offer.amount,
        equityPercentage: offer.equityPercentage,
        status: offer.status,
        meetingScheduled: offer.meetingScheduled,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedOffers.length} investment offers`);
    
    // Pitches
    const pitchesData = [
      {
        startupId: insertedStartups[0].id,
        title: "Pitch to Angel Group",
        description: "30-minute pitch to Tech Angels group",
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        duration: 30,
        status: "scheduled"
      },
      {
        startupId: insertedStartups[0].id,
        title: "1:1 with Future Fund",
        description: "Deep dive discussion with Future Fund",
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        duration: 60,
        status: "scheduled"
      },
      {
        startupId: insertedStartups[1].id,
        title: "Demo Day Presentation",
        description: "5-minute pitch at Accelerator Demo Day",
        scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        duration: 15,
        status: "scheduled"
      }
    ];
    
    const insertedPitches = await db.insert(pitches).values(
      pitchesData.map(pitch => ({
        id: uuidv4(),
        startupId: pitch.startupId,
        title: pitch.title,
        description: pitch.description,
        scheduledAt: pitch.scheduledAt,
        duration: pitch.duration,
        status: pitch.status,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedPitches.length} pitches`);
    
    // Pitch rooms
    const pitchRoomsData = [
      {
        startupId: insertedStartups[0].id,
        investorId: insertedInvestorProfiles[0].id,
        startupUserId: insertedFounders[0].id,
        investorUserId: insertedInvestors[0].id,
        name: "TechVision AI + Venture Fund Capital",
        description: "Initial pitch discussion",
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      {
        startupId: insertedStartups[0].id,
        investorId: insertedInvestorProfiles[1].id,
        startupUserId: insertedFounders[0].id,
        investorUserId: insertedInvestors[1].id,
        name: "TechVision AI + Future Fund",
        description: "Follow-up pitch meeting",
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        avatarUrl: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      }
    ];
    
    const insertedPitchRooms = await db.insert(pitchRooms).values(
      pitchRoomsData.map(room => ({
        id: uuidv4(),
        startupId: room.startupId,
        investorId: room.investorId,
        startupUserId: room.startupUserId,
        investorUserId: room.investorUserId,
        name: room.name,
        description: room.description,
        avatarUrl: room.avatarUrl,
        scheduledAt: room.scheduledAt,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedPitchRooms.length} pitch rooms`);
    
    // Feedback
    const feedbackData = [
      {
        startupId: insertedStartups[0].id,
        investorId: insertedInvestorProfiles[0].id,
        teamRating: 4.5,
        productRating: 4.2,
        marketRating: 3.8,
        comment: "Strong team with relevant industry experience. Your market analysis is compelling but could use more detail on competitive landscape. Consider strengthening the go-to-market strategy slide."
      },
      {
        startupId: insertedStartups[0].id,
        investorId: insertedInvestorProfiles[1].id,
        teamRating: 4.0,
        productRating: 4.5,
        marketRating: 4.0,
        comment: "The tech solution is innovative. Would like to see more traction metrics in the next presentation. Overall, promising concept."
      }
    ];
    
    const insertedFeedback = await db.insert(feedback).values(
      feedbackData.map(item => ({
        id: uuidv4(),
        startupId: item.startupId,
        investorId: item.investorId,
        teamRating: item.teamRating,
        productRating: item.productRating,
        marketRating: item.marketRating,
        comment: item.comment,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ).returning();
    
    console.log(`Inserted ${insertedFeedback.length} feedback items`);
    
    console.log("Database seeding completed successfully");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
