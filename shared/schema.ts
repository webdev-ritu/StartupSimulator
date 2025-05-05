import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// Users
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("founder"),
  bio: text("bio"),
  avatar: text("avatar"),
  location: text("location"),
  company: text("company"),
  title: text("title"),
  website: text("website"),
  twitterHandle: text("twitter_handle"),
  linkedinHandle: text("linkedin_handle"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const usersRelations = relations(users, ({ one, many }) => ({
  startup: one(startups, {
    fields: [users.id],
    references: [startups.userId]
  }),
  investor: one(investors, {
    fields: [users.id],
    references: [investors.userId]
  })
}));

export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories
export const categories = pgTable("categories", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  startups: many(startups)
}));

// Stages
export const stages = pgTable("stages", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  name: text("name").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const stagesRelations = relations(stages, ({ many }) => ({
  startups: many(startups)
}));

// Sectors
export const sectors = pgTable("sectors", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const sectorsRelations = relations(sectors, ({ many }) => ({
  investorPreferences: many(investorPreferencesSectors)
}));

// Business Models
export const businessModels = pgTable("business_models", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Startups
export const startups = pgTable("startups", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  tagline: text("tagline"),
  description: text("description"),
  logoUrl: text("logo_url"),
  stage: text("stage"),
  categoryId: text("category_id").references(() => categories.id),
  location: text("location"),
  website: text("website"),
  teamSize: integer("team_size"),
  foundedYear: integer("founded_year"),
  marketSize: text("market_size"),
  businessModel: text("business_model"),
  pitchDeckUrl: text("pitch_deck_url"),
  pitchDeckFilename: text("pitch_deck_filename"),
  pitchDeckUpdatedAt: timestamp("pitch_deck_updated_at"),
  pitchDeckSlides: integer("pitch_deck_slides"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const startupsRelations = relations(startups, ({ one, many }) => ({
  user: one(users, {
    fields: [startups.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [startups.categoryId],
    references: [categories.id]
  }),
  fundingRounds: many(fundingRounds),
  capTables: many(capTables),
  feedback: many(feedback),
  pitches: many(pitches),
  pitchRooms: many(pitchRooms)
}));

// Investors
export const investors = pgTable("investors", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  company: text("company").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  availabilityStatus: text("availability_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const investorsRelations = relations(investors, ({ one, many }) => ({
  user: one(users, {
    fields: [investors.userId],
    references: [users.id]
  }),
  preferences: one(investorPreferences),
  offers: many(offers),
  capTables: many(capTables),
  feedback: many(feedback),
  pitchRooms: many(pitchRooms),
  bookmarks: many(bookmarks)
}));

// Investor Preferences
export const investorPreferences = pgTable("investor_preferences", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  investorId: text("investor_id").notNull().references(() => investors.id),
  minInvestment: integer("min_investment"),
  maxInvestment: integer("max_investment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const investorPreferencesRelations = relations(investorPreferences, ({ one, many }) => ({
  investor: one(investors, {
    fields: [investorPreferences.investorId],
    references: [investors.id]
  }),
  sectors: many(investorPreferencesSectors),
  stages: many(investorPreferencesStages)
}));

// Many-to-many: Investor Preferences <-> Sectors
export const investorPreferencesSectors = pgTable("investor_preferences_sectors", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  preferenceId: text("preference_id").notNull().references(() => investorPreferences.id),
  sectorId: text("sector_id").notNull().references(() => sectors.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const investorPreferencesSectorsRelations = relations(investorPreferencesSectors, ({ one }) => ({
  preference: one(investorPreferences, {
    fields: [investorPreferencesSectors.preferenceId],
    references: [investorPreferences.id]
  }),
  sector: one(sectors, {
    fields: [investorPreferencesSectors.sectorId],
    references: [sectors.id]
  })
}));

// Many-to-many: Investor Preferences <-> Stages
export const investorPreferencesStages = pgTable("investor_preferences_stages", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  preferenceId: text("preference_id").notNull().references(() => investorPreferences.id),
  stageId: text("stage_id").notNull().references(() => stages.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const investorPreferencesStagesRelations = relations(investorPreferencesStages, ({ one }) => ({
  preference: one(investorPreferences, {
    fields: [investorPreferencesStages.preferenceId],
    references: [investorPreferences.id]
  }),
  stage: one(stages, {
    fields: [investorPreferencesStages.stageId],
    references: [stages.id]
  })
}));

// Funding Rounds
export const fundingRounds = pgTable("funding_rounds", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  startupId: text("startup_id").notNull().references(() => startups.id),
  askAmount: integer("ask_amount").notNull(),
  equityOffered: decimal("equity_offered", { precision: 5, scale: 2 }).notNull(),
  valuation: integer("valuation"),
  valuationChange: text("valuation_change"),
  status: text("status").notNull().default("active"),
  closingDate: timestamp("closing_date").notNull(),
  acceptedOffers: integer("accepted_offers"), // Cache field for quick queries
  offersCount: integer("offers_count"), // Cache field for quick queries
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const fundingRoundsRelations = relations(fundingRounds, ({ one, many }) => ({
  startup: one(startups, {
    fields: [fundingRounds.startupId],
    references: [startups.id]
  }),
  offers: many(offers)
}));

// Investment Offers
export const offers = pgTable("offers", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  fundingRoundId: text("funding_round_id").notNull().references(() => fundingRounds.id),
  investorId: text("investor_id").notNull().references(() => investors.id),
  amount: integer("amount").notNull(),
  equityPercentage: decimal("equity_percentage", { precision: 5, scale: 2 }).notNull(),
  status: text("status").notNull().default("offered"), // offered, countered, accepted, rejected
  meetingScheduled: timestamp("meeting_scheduled"),
  acceptedAt: timestamp("accepted_at"),
  rejectedAt: timestamp("rejected_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const offersRelations = relations(offers, ({ one }) => ({
  fundingRound: one(fundingRounds, {
    fields: [offers.fundingRoundId],
    references: [fundingRounds.id]
  }),
  investor: one(investors, {
    fields: [offers.investorId],
    references: [investors.id]
  })
}));

// Cap Table
export const capTables = pgTable("cap_tables", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  startupId: text("startup_id").notNull().references(() => startups.id),
  investorId: text("investor_id").notNull().references(() => investors.id),
  equity: decimal("equity", { precision: 5, scale: 2 }).notNull(),
  investment: integer("investment").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const capTablesRelations = relations(capTables, ({ one }) => ({
  startup: one(startups, {
    fields: [capTables.startupId],
    references: [startups.id]
  }),
  investor: one(investors, {
    fields: [capTables.investorId],
    references: [investors.id]
  })
}));

// Pitches
export const pitches = pgTable("pitches", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  startupId: text("startup_id").notNull().references(() => startups.id),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull().default(30), // in minutes
  status: text("status").notNull().default("scheduled"), // scheduled, active, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const pitchesRelations = relations(pitches, ({ one }) => ({
  startup: one(startups, {
    fields: [pitches.startupId],
    references: [startups.id]
  })
}));

// Pitch Rooms
export const pitchRooms = pgTable("pitch_rooms", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  startupId: text("startup_id").notNull().references(() => startups.id),
  investorId: text("investor_id").notNull().references(() => investors.id),
  startupUserId: text("startup_user_id").notNull().references(() => users.id),
  investorUserId: text("investor_user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  pitchDeckUrl: text("pitch_deck_url"),
  avatarUrl: text("avatar_url"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const pitchRoomsRelations = relations(pitchRooms, ({ one, many }) => ({
  startup: one(startups, {
    fields: [pitchRooms.startupId],
    references: [startups.id]
  }),
  investor: one(investors, {
    fields: [pitchRooms.investorId],
    references: [investors.id]
  }),
  messages: many(pitchRoomMessages)
}));

// Pitch Room Messages
export const pitchRoomMessages = pgTable("pitch_room_messages", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  pitchRoomId: text("pitch_room_id").notNull().references(() => pitchRooms.id),
  senderId: text("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const pitchRoomMessagesRelations = relations(pitchRoomMessages, ({ one }) => ({
  pitchRoom: one(pitchRooms, {
    fields: [pitchRoomMessages.pitchRoomId],
    references: [pitchRooms.id]
  }),
  sender: one(users, {
    fields: [pitchRoomMessages.senderId],
    references: [users.id]
  })
}));

// Feedback
export const feedback = pgTable("feedback", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  startupId: text("startup_id").notNull().references(() => startups.id),
  investorId: text("investor_id").notNull().references(() => investors.id),
  teamRating: decimal("team_rating", { precision: 3, scale: 1 }).notNull(),
  productRating: decimal("product_rating", { precision: 3, scale: 1 }).notNull(),
  marketRating: decimal("market_rating", { precision: 3, scale: 1 }).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const feedbackRelations = relations(feedback, ({ one }) => ({
  startup: one(startups, {
    fields: [feedback.startupId],
    references: [startups.id]
  }),
  investor: one(investors, {
    fields: [feedback.investorId],
    references: [investors.id]
  })
}));

// Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),
  investorId: text("investor_id").notNull().references(() => investors.id),
  startupId: text("startup_id").notNull().references(() => startups.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  investor: one(investors, {
    fields: [bookmarks.investorId],
    references: [investors.id]
  }),
  startup: one(startups, {
    fields: [bookmarks.startupId],
    references: [startups.id]
  })
}));
