import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

interface Client {
  userId: string;
  userRole: "founder" | "investor";
  ws: WebSocket;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  roomId: string;
}

interface PitchRoom {
  id: string;
  clients: Map<string, Client>;
  messages: any[];
}

// Store active pitch rooms by room ID
const pitchRooms = new Map<string, PitchRoom>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/');
    
    // Handle pitch room connections
    if (pathParts[1] === 'pitch-room' && pathParts.length >= 3) {
      const roomId = pathParts[2];
      
      // Parse query parameters for user info
      const params = new URLSearchParams(url.search);
      const userId = params.get('userId');
      const userRole = params.get('userRole') as "founder" | "investor";
      
      if (!userId || !userRole) {
        ws.close(1008, "Missing user information");
        return;
      }

      // Initialize pitch room if it doesn't exist
      if (!pitchRooms.has(roomId)) {
        pitchRooms.set(roomId, {
          id: roomId,
          clients: new Map(),
          messages: []
        });
      }
      
      const room = pitchRooms.get(roomId)!;
      
      // Add client to the room
      room.clients.set(userId, {
        userId,
        userRole,
        ws
      });
      
      // Send chat history to the new client
      ws.send(JSON.stringify({
        type: "history",
        messages: room.messages
      }));
      
      // Handle messages from this client
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === "message" && data.data) {
            // Process and store the message
            const messageData = data.data as ChatMessage;
            const savedMessage = await storage.savePitchRoomMessage(
              roomId,
              messageData.senderId,
              messageData.content
            );
            
            if (savedMessage) {
              // Add to room messages and broadcast to all clients
              room.messages.push(savedMessage);
              
              room.clients.forEach((client) => {
                if (client.ws.readyState === WebSocket.OPEN) {
                  client.ws.send(JSON.stringify({
                    type: "message",
                    message: savedMessage
                  }));
                }
              });
            }
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });
      
      // Handle client disconnect
      ws.on('close', () => {
        room.clients.delete(userId);
        
        // Clean up empty rooms
        if (room.clients.size === 0) {
          pitchRooms.delete(roomId);
        }
      });
    }
  });

  // API routes
  const apiPrefix = "/api";

  // User Authentication and Profile
  app.get(`${apiPrefix}/me`, async (req, res) => {
    try {
      // In a real app, this would get user data from the session
      const user = await storage.getCurrentUser();
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  app.put(`${apiPrefix}/me`, async (req, res) => {
    try {
      const userData = req.body;
      const updatedUser = await storage.updateUserProfile(userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user data" });
    }
  });

  // Founder Dashboard
  app.get(`${apiPrefix}/founder/dashboard`, async (req, res) => {
    try {
      const dashboardData = await storage.getFounderDashboard();
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching founder dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.get(`${apiPrefix}/founder/startup`, async (req, res) => {
    try {
      const startupData = await storage.getFounderStartup();
      res.json(startupData);
    } catch (error) {
      console.error("Error fetching startup data:", error);
      res.status(500).json({ error: "Failed to fetch startup data" });
    }
  });

  app.put(`${apiPrefix}/founder/startup`, async (req, res) => {
    try {
      const startupData = req.body;
      const updatedStartup = await storage.updateStartupProfile(startupData);
      res.json(updatedStartup);
    } catch (error) {
      console.error("Error updating startup:", error);
      res.status(500).json({ error: "Failed to update startup data" });
    }
  });

  app.get(`${apiPrefix}/founder/funding-round`, async (req, res) => {
    try {
      const fundingRoundData = await storage.getCurrentFundingRound();
      res.json(fundingRoundData);
    } catch (error) {
      console.error("Error fetching funding round:", error);
      res.status(500).json({ error: "Failed to fetch funding round data" });
    }
  });

  app.get(`${apiPrefix}/founder/pitches`, async (req, res) => {
    try {
      const pitchesData = await storage.getFounderPitches();
      res.json(pitchesData);
    } catch (error) {
      console.error("Error fetching pitches:", error);
      res.status(500).json({ error: "Failed to fetch pitches data" });
    }
  });

  app.get(`${apiPrefix}/founder/feedback`, async (req, res) => {
    try {
      const feedbackData = await storage.getFounderFeedback();
      res.json(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback data" });
    }
  });

  app.get(`${apiPrefix}/founder/cap-table`, async (req, res) => {
    try {
      const capTableData = await storage.getCapTable();
      res.json(capTableData);
    } catch (error) {
      console.error("Error fetching cap table:", error);
      res.status(500).json({ error: "Failed to fetch cap table data" });
    }
  });

  app.post(`${apiPrefix}/founder/funding-rounds/:roundId/offers/:investorId/accept`, async (req, res) => {
    try {
      const { roundId, investorId } = req.params;
      const result = await storage.acceptInvestmentOffer(roundId, investorId);
      res.json(result);
    } catch (error) {
      console.error("Error accepting offer:", error);
      res.status(500).json({ error: "Failed to accept investment offer" });
    }
  });

  app.post(`${apiPrefix}/founder/funding-rounds/:roundId/offers/:investorId/counter`, async (req, res) => {
    try {
      const { roundId, investorId } = req.params;
      const { amount, equity } = req.body;
      
      const result = await storage.submitCounterOffer(roundId, investorId, amount, equity);
      res.json(result);
    } catch (error) {
      console.error("Error submitting counter offer:", error);
      res.status(500).json({ error: "Failed to submit counter offer" });
    }
  });

  // Investor Dashboard
  app.get(`${apiPrefix}/investor/dashboard`, async (req, res) => {
    try {
      const dashboardData = await storage.getInvestorDashboard();
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching investor dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.get(`${apiPrefix}/investor/startups`, async (req, res) => {
    try {
      const startupsData = await storage.getStartupsForInvestor();
      res.json(startupsData);
    } catch (error) {
      console.error("Error fetching startups for investor:", error);
      res.status(500).json({ error: "Failed to fetch startups data" });
    }
  });

  app.post(`${apiPrefix}/investor/startups/:startupId/bookmark`, async (req, res) => {
    try {
      const { startupId } = req.params;
      const { bookmarked } = req.body;
      
      const result = await storage.toggleStartupBookmark(startupId, bookmarked);
      res.json(result);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ error: "Failed to toggle startup bookmark" });
    }
  });

  app.get(`${apiPrefix}/investor/portfolio`, async (req, res) => {
    try {
      const portfolioData = await storage.getInvestorPortfolio();
      res.json(portfolioData);
    } catch (error) {
      console.error("Error fetching investor portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio data" });
    }
  });

  app.get(`${apiPrefix}/investor/pitches`, async (req, res) => {
    try {
      const pitchesData = await storage.getInvestorPitches();
      res.json(pitchesData);
    } catch (error) {
      console.error("Error fetching investor pitches:", error);
      res.status(500).json({ error: "Failed to fetch pitches data" });
    }
  });

  // Startups Listing
  app.get(`${apiPrefix}/startups`, async (req, res) => {
    try {
      const { search, category, stage } = req.query;
      
      const startupsData = await storage.getStartups({
        search: search as string,
        category: category as string,
        stage: stage as string
      });
      
      res.json(startupsData);
    } catch (error) {
      console.error("Error fetching startups:", error);
      res.status(500).json({ error: "Failed to fetch startups data" });
    }
  });
  
  app.get(`${apiPrefix}/startups/categories`, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  
  app.get(`${apiPrefix}/startups/stages`, async (req, res) => {
    try {
      const stages = await storage.getStages();
      res.json(stages);
    } catch (error) {
      console.error("Error fetching stages:", error);
      res.status(500).json({ error: "Failed to fetch stages" });
    }
  });

  // Investors Listing
  app.get(`${apiPrefix}/investors`, async (req, res) => {
    try {
      const { search, sector, stage } = req.query;
      
      const investorsData = await storage.getInvestors({
        search: search as string,
        sector: sector as string,
        stage: stage as string
      });
      
      res.json(investorsData);
    } catch (error) {
      console.error("Error fetching investors:", error);
      res.status(500).json({ error: "Failed to fetch investors data" });
    }
  });
  
  app.get(`${apiPrefix}/investors/sectors`, async (req, res) => {
    try {
      const sectors = await storage.getSectors();
      res.json(sectors);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      res.status(500).json({ error: "Failed to fetch sectors" });
    }
  });
  
  app.get(`${apiPrefix}/investors/stages`, async (req, res) => {
    try {
      const stages = await storage.getStages(); // Reusing the same stages
      res.json(stages);
    } catch (error) {
      console.error("Error fetching stages:", error);
      res.status(500).json({ error: "Failed to fetch stages" });
    }
  });

  // Pitch Rooms
  app.get(`${apiPrefix}/pitch-rooms`, async (req, res) => {
    try {
      const pitchRooms = await storage.getPitchRooms();
      res.json(pitchRooms);
    } catch (error) {
      console.error("Error fetching pitch rooms:", error);
      res.status(500).json({ error: "Failed to fetch pitch rooms" });
    }
  });
  
  app.get(`${apiPrefix}/pitch-rooms/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const pitchRoom = await storage.getPitchRoomById(id);
      
      if (!pitchRoom) {
        return res.status(404).json({ error: "Pitch room not found" });
      }
      
      res.json(pitchRoom);
    } catch (error) {
      console.error("Error fetching pitch room:", error);
      res.status(500).json({ error: "Failed to fetch pitch room" });
    }
  });
  
  // Leaderboard
  app.get(`${apiPrefix}/leaderboard`, async (req, res) => {
    try {
      const { timeRange, category } = req.query;
      
      const leaderboardData = await storage.getLeaderboard({
        timeRange: timeRange as string,
        category: category as string
      });
      
      res.json(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard data" });
    }
  });
  
  // Reference data
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  
  app.get(`${apiPrefix}/stages`, async (req, res) => {
    try {
      const stages = await storage.getStages();
      res.json(stages);
    } catch (error) {
      console.error("Error fetching stages:", error);
      res.status(500).json({ error: "Failed to fetch stages" });
    }
  });
  
  app.get(`${apiPrefix}/business-models`, async (req, res) => {
    try {
      const businessModels = await storage.getBusinessModels();
      res.json(businessModels);
    } catch (error) {
      console.error("Error fetching business models:", error);
      res.status(500).json({ error: "Failed to fetch business models" });
    }
  });

  return httpServer;
}
