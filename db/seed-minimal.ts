import { db } from "./index";
import { users } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";

async function seed() {
  try {
    // First check if data already exists to avoid duplicating
    const existingUsersCount = await db.execute(sql`SELECT COUNT(*) FROM users`);
    
    if (existingUsersCount.rows.length > 0 && Number(existingUsersCount.rows[0].count) > 0) {
      console.log("Database already has data. Skipping seed.");
      return;
    }
    
    console.log("Seeding database with minimal data...");
    
    // Create a founder user
    const founderPassword = await bcrypt.hash("password123", 10);
    const founderId = uuidv4();
    
    const founderData = {
      id: founderId,
      username: "founder",
      password: founderPassword,
      name: "Demo Founder",
      email: "founder@example.com",
      role: "founder",
      bio: "Startup founder with experience in tech",
      location: "San Francisco, CA",
      title: "CEO & Founder",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [insertedFounder] = await db.insert(users).values(founderData).returning();
    console.log("Inserted founder user:", insertedFounder.name);
    
    // Create an investor user
    const investorPassword = await bcrypt.hash("password123", 10);
    const investorId = uuidv4();
    
    const investorData = {
      id: investorId,
      username: "investor",
      password: investorPassword,
      name: "Demo Investor",
      email: "investor@example.com",
      role: "investor",
      bio: "Experienced investor looking for early-stage startups",
      location: "New York, NY",
      title: "Managing Partner",
      company: "Demo Ventures",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [insertedInvestor] = await db.insert(users).values(investorData).returning();
    console.log("Inserted investor user:", insertedInvestor.name);
    
    // Create a startup for the founder
    await db.execute(sql`
      INSERT INTO startups (
        id, user_id, name, tagline, description, location, created_at, updated_at
      ) VALUES (
        ${uuidv4()}, ${founderId}, 'Demo Startup', 
        'A revolutionary product', 
        'This is a demo startup description', 
        'San Francisco, CA',
        NOW(), NOW()
      )
    `);
    
    // Create an investor profile
    await db.execute(sql`
      INSERT INTO investors (
        id, user_id, name, company, bio, availability_status, created_at, updated_at
      ) VALUES (
        ${uuidv4()}, ${investorId}, 'Demo Investor', 
        'Demo Ventures', 
        'Experienced investor looking for early-stage startups',
        'Available',
        NOW(), NOW()
      )
    `);
    
    console.log("Database seeded with test users and related entities!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();

// End of seed file