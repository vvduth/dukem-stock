"use server";

import { connectToDatabase } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";

export const getWatchlistSymbolsByEmail = async (
  email: string
): Promise<string[]> => {
  try {
    // Connect to database
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      console.error("Database connection not established");
      return [];
    }

    // Find user by email in Better Auth user collection
    const user = await db.collection("users").findOne(
      { email },
      {
        projection: {
          _id: 1,
          id: 1,
        },
      }
    );

    // Return empty array if user not found
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return [];
    }

    // Get userId - prefer 'id' field, fallback to '_id'
    const userId = user.id || user._id.toString();

    // Query watchlist for this user
    const watchlistItems = await Watchlist.find(
      { userId },
      { symbol: 1, _id: 0 }
    ).lean();

    // Extract and return just the symbols as strings
    return watchlistItems.map((item) => item.symbol);
  } catch (error) {
    console.error("Error fetching watchlist symbols:", error);
    return [];
  }
};
