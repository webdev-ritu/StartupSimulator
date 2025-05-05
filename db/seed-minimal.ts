import { db } from "./index";
import { users } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { count } from "drizzle-orm";

async function seed() {
  try {
    // First check if data already exists to avoid duplicating
    const existingUsersCount = await db.select({ count: count("*") }).from(users);
    
    if (existingUsersCount[0].count > 0) {
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
    
    console.log("Database seeded with test user!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();

// End of seed file