/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Define the server port
const PORT = 3000;

// Secret key for signing JWTs
const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_12345";

// Database file path for persisting users, search history, and reviews
const DB_FILE = path.join(process.cwd(), "database.json");

// Define types for local database structure
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

interface SearchHistory {
  id: string;
  userEmail: string;
  query: string;
  timestamp: string;
}

interface DbSchema {
  users: User[];
  history: SearchHistory[];
}

// Initial default schema for local database
const DEFAULT_DB: DbSchema = {
  users: [],
  history: [],
};

/**
 * Reads database from JSON file.
 * Returns default database structure if file is not found or corrupted, and heals the file.
 */
async function readDb(): Promise<DbSchema> {
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    if (!data.trim()) {
      throw new Error("Database file is empty");
    }
    return JSON.parse(data);
  } catch (err: any) {
    console.warn("Database missing, empty or corrupt, creating/healing with DEFAULT_DB...", err.message || err);
    try {
      await writeDb(DEFAULT_DB);
    } catch (writeErr) {
      console.error("Failed to write healed database:", writeErr);
    }
    return DEFAULT_DB;
  }
}

/**
 * Writes data object to the JSON database file.
 */
async function writeDb(data: DbSchema): Promise<void> {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// Initialize Lazy Gemini AI Client to avoid startup crashes if API Key is missing
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. Falling back to algorithmic comparison logic.");
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Mock Product Definitions
interface ProductReview {
  author: string;
  rating: number;
  text: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  amazonPrice: number;
  flipkartPrice: number;
  rating: number;
  imageUrl: string;
  specs: Record<string, string>;
  reviews: ProductReview[];
}

const PRODUCTS: Product[] = [
  {
    id: "iphone-15",
    name: "Apple iPhone 15 (128GB)",
    category: "Smartphones",
    amazonPrice: 71200,
    flipkartPrice: 69999,
    rating: 4.6,
    imageUrl: "smartphone",
    specs: {
      "Display": "6.1 inches Super Retina XDR OLED",
      "Processor": "Apple A16 Bionic (4 nm)",
      "RAM": "6 GB",
      "Storage": "128 GB",
      "Main Camera": "48 MP + 12 MP Dual",
      "Battery": "3349 mAh, 15W MagSafe"
    },
    reviews: [
      { author: "Aman Sharma", rating: 5, text: "Outstanding display and premium build quality! Easily lasts a whole day." },
      { author: "Riya Patel", rating: 4, text: "Excellent photos but misses a telephoto zoom lens at this high price." },
      { author: "John D.", rating: 5, text: "Transitioned from iPhone 11, the speed improvement and camera are breathtaking." }
    ]
  },
  {
    id: "galaxy-s24",
    name: "Samsung Galaxy S24 (256GB)",
    category: "Smartphones",
    amazonPrice: 74999,
    flipkartPrice: 75500,
    rating: 4.5,
    imageUrl: "smartphone",
    specs: {
      "Display": "6.2 inches Dynamic AMOLED 2X, 120Hz",
      "Processor": "Exynos 2400 / Snapdragon 8 Gen 3",
      "RAM": "8 GB",
      "Storage": "256 GB",
      "Main Camera": "50 MP + 10 MP + 12 MP Triple",
      "Battery": "4000 mAh, 25W Wired"
    },
    reviews: [
      { author: "Nikhil Gupta", rating: 5, text: "The Galaxy AI features are highly practical. Live Translation works wonders!" },
      { author: "Sneha Reddy", rating: 4, text: "Sleek hand feel, perfect size. Battery backup is slightly lower on heavier usage." }
    ]
  },
  {
    id: "oneplus-12r",
    name: "OnePlus 12R (256GB)",
    category: "Smartphones",
    amazonPrice: 42999,
    flipkartPrice: 41999,
    rating: 4.4,
    imageUrl: "smartphone",
    specs: {
      "Display": "6.78 inches LTPO4 AMOLED, 120Hz",
      "Processor": "Snapdragon 8 Gen 2 (4 nm)",
      "RAM": "16 GB",
      "Storage": "256 GB UFS 3.1",
      "Main Camera": "50 MP + 8 MP + 2 MP Triple",
      "Battery": "5500 mAh, 100W SUPERVOOC"
    },
    reviews: [
      { author: "Kabir Das", rating: 5, text: "Charges from 1% to 100% in just 26 minutes! The battery life is absolutely insane." },
      { author: "Vikram S.", rating: 4, text: "Extremely smooth software. Camera is great in daylight, but average in night shots." }
    ]
  },
  {
    id: "macbook-air-m3",
    name: "Apple MacBook Air M3 (13.6-inch)",
    category: "Laptops",
    amazonPrice: 104900,
    flipkartPrice: 102990,
    rating: 4.8,
    imageUrl: "laptop",
    specs: {
      "Display": "13.6-inch Liquid Retina Display",
      "Processor": "Apple M3 (8-core CPU, 8-core GPU)",
      "RAM": "8 GB Unified Memory",
      "Storage": "256 GB Superfast SSD",
      "Battery Life": "Up to 18 hours",
      "Weight": "1.24 kg (Ultra-portable)"
    },
    reviews: [
      { author: "Sameer Verma", rating: 5, text: "The M3 chip handles coding, multitasking, and casual editing flawlessly." },
      { author: "Ananya Sen", rating: 4, text: "Best laptop ever. Perfectly silent fanless design, but Apple should provide 16GB as base." }
    ]
  },
  {
    id: "asus-rog-g14",
    name: "Asus ROG Zephyrus G14 OLED",
    category: "Laptops",
    amazonPrice: 149990,
    flipkartPrice: 152000,
    rating: 4.7,
    imageUrl: "laptop",
    specs: {
      "Display": "14-inch ROG Nebula OLED, 120Hz",
      "Processor": "AMD Ryzen 9 8945HS",
      "Graphics": "NVIDIA GeForce RTX 4060 8GB GDDR6",
      "RAM": "16 GB LPDDR5X",
      "Storage": "1 TB PCIe 4.0 SSD",
      "Weight": "1.50 kg"
    },
    reviews: [
      { author: "GamerBoi", rating: 5, text: "The OLED screen is stunning. Blacks are true black, and gaming performance is incredible!" },
      { author: "Rohan Malhotra", rating: 4, text: "Perfect balance of portability and power. Fans can get pretty loud in Turbo Mode." }
    ]
  },
  {
    id: "sony-wh1000xm5",
    name: "Sony WH-1000XM5 ANC Headphones",
    category: "Audio",
    amazonPrice: 27990,
    flipkartPrice: 29900,
    rating: 4.6,
    imageUrl: "headphones",
    specs: {
      "Driver Size": "30mm Dynamic Driver",
      "Noise Cancellation": "Dual Processor V1 + QN1 HD ANC",
      "Battery Life": "Up to 30 hours with ANC",
      "Bluetooth": "Bluetooth 5.2 (LDAC, AAC, SBC)",
      "Features": "Speak-to-Chat, Multi-point connection"
    },
    reviews: [
      { author: "Pooja Hegde", rating: 5, text: "Active Noise Cancellation is mindblowing. It silences noisy office environments completely." },
      { author: "David K.", rating: 4, text: "Audio quality is crisp and customisable via EQ. Design looks clean but they don't fold down like XM4s." }
    ]
  },
  {
    id: "nothing-ear-a",
    name: "Nothing Ear (a) TWS Earbuds",
    category: "Audio",
    amazonPrice: 7999,
    flipkartPrice: 6999,
    rating: 4.3,
    imageUrl: "earbuds",
    specs: {
      "Driver Size": "11mm Dynamic Driver",
      "Noise Cancellation": "Up to 45dB Smart ANC",
      "Battery Life": "Up to 42.5 hours with case (ANC off)",
      "IP Rating": "IP54 Buds / IPX2 Case",
      "Features": "LDAC High-Res Audio, ChatGPT Integration"
    },
    reviews: [
      { author: "Aniket J.", rating: 5, text: "Unique transparent design, stands out. Bass is punchy, and the yellow case looks beautiful." },
      { author: "Tina Roy", rating: 4, text: "Extremely comfortable for long wear. ANC is decent for commuting, though not top-tier." }
    ]
  },
  {
    id: "apple-watch-s9",
    name: "Apple Watch Series 9 GPS",
    category: "Smartwatches",
    amazonPrice: 36900,
    flipkartPrice: 35999,
    rating: 4.7,
    imageUrl: "watch",
    specs: {
      "Display": "Always-On Retina OLED, up to 2000 nits",
      "Processor": "Apple S9 SiP",
      "Sensors": "ECG, Blood Oxygen, Temperature, Fall Detection",
      "Battery": "Up to 18 hours (36 hrs low power)",
      "Feature": "Double Tap Gesture control"
    },
    reviews: [
      { author: "Vikram Rathore", rating: 5, text: "Double-tap finger gesture is incredibly useful when holding coffee. Health metrics are lab-grade accurate." },
      { author: "Sara Jones", rating: 4, text: "Beautiful watch, very smart. I just wish the battery lasted longer than a day." }
    ]
  },
  {
    id: "galaxy-watch-6",
    name: "Samsung Galaxy Watch 6 LTE",
    category: "Smartwatches",
    amazonPrice: 22999,
    flipkartPrice: 21499,
    rating: 4.3,
    imageUrl: "watch",
    specs: {
      "Display": "1.4-inch Super AMOLED Display",
      "Processor": "Exynos W930 Dual-core 1.4GHz",
      "RAM/Storage": "2 GB RAM + 16 GB ROM",
      "OS": "Wear OS 4 Powered by Samsung",
      "Sensors": "BioActive Sensor (HR, ECG, BIA), Sleep Analysis"
    },
    reviews: [
      { author: "Manish Shah", rating: 4, text: "Sleep coach features have genuinely improved my sleep schedule. Screen is bright and gorgeous." },
      { author: "Elena V.", rating: 5, text: "Seamless connection to my Galaxy phone. Looks premium on the wrist, LTE function works perfectly without phone." }
    ]
  }
];

// Express middleware to parse JSON requests
const app = express();
app.use(express.json());

/**
 * Authentication Middleware:
 * Validates JWT tokens provided in the Authorization header.
 * Attaches decoded user payload to the request.
 */
interface AuthenticatedRequest extends Request {
  userEmail?: string;
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }
    req.userEmail = decoded.email;
    next();
  });
};

/**
 * Endpoint: POST /api/auth/register
 * Purpose: Hashes password, registers a new user with name, email, and password.
 */
app.post("/api/auth/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "All fields are required (name, email, password)" });
      return;
    }

    const db = await readDb();

    // Check if user already exists
    const userExists = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      res.status(400).json({ error: "A user with this email already exists" });
      return;
    }

    // Hash the password using BCrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user record
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email: email.toLowerCase(),
      passwordHash,
    };

    db.users.push(newUser);
    await writeDb(db);

    res.status(201).json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Endpoint: POST /api/auth/login
 * Purpose: Verifies email & password, issues a signed secure JWT.
 */
app.post("/api/auth/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const db = await readDb();

    // Find the user by email
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Verify BCrypt password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Sign JWT token
    const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Endpoint: GET /api/user/profile
 * Purpose: Verifies authenticity and returns current active profile data.
 */
app.get("/api/user/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = await readDb();
    const user = db.users.find((u) => u.email === req.userEmail);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Endpoint: GET /api/products/search
 * Purpose: Searches products by keyword, and optionally appends to search history if token exists.
 */
app.get("/api/products/search", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string || "").trim().toLowerCase();
    
    // Filter mock product inventory
    const filteredProducts = PRODUCTS.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        Object.values(product.specs).some((spec) => spec.toLowerCase().includes(query))
      );
    });

    // Optionally record search query in history if authorized user is querying
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (token && query) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
        const db = await readDb();
        
        // Push query history
        const newHistoryItem: SearchHistory = {
          id: Math.random().toString(36).substring(2, 9),
          userEmail: decoded.email,
          query: req.query.q as string,
          timestamp: new Date().toISOString(),
        };
        db.history.push(newHistoryItem);
        await writeDb(db);
      } catch (err) {
        // Soft catch if token is invalid, we still return the product search result
        console.warn("Soft catch: invalid token in search history logger.");
      }
    }

    res.json(filteredProducts);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Endpoint: GET /api/products/compare
 * Purpose: Side-by-side product retrieval given a list of comma-separated ids.
 */
app.get("/api/products/compare", (req: Request, res: Response): void => {
  try {
    const idsString = req.query.ids as string || "";
    if (!idsString) {
      res.status(400).json({ error: "Product IDs are required (comma-separated)" });
      return;
    }

    const ids = idsString.split(",").map((id) => id.trim());
    const matchedProducts = PRODUCTS.filter((p) => ids.includes(p.id));

    res.json(matchedProducts);
  } catch (error) {
    console.error("Compare error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Endpoint: POST /api/products/ai-recommend
 * Purpose: Smart AI recommendation utilizing Gemini models via `@google/genai` or robust fallback logic.
 */
app.post("/api/products/ai-recommend", async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds, userPreference } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ error: "An array of product IDs is required for AI recommendation." });
      return;
    }

    // Retrieve full product profiles
    const compareList = PRODUCTS.filter((p) => productIds.includes(p.id));

    if (compareList.length === 0) {
      res.status(404).json({ error: "No matching products found to analyze." });
      return;
    }

    const ai = getGeminiClient();

    // If Gemini client is unavailable (e.g., missing API key), fallback to custom simulated AI/heuristic analysis
    if (!ai) {
      // Calculate algorithmic "best value" (price/rating ratio) and premium
      let bestValueProduct = compareList[0];
      let bestValueScore = -1;

      let premiumProduct = compareList[0];
      let highestRating = -1;

      compareList.forEach((product) => {
        const avgPrice = (product.amazonPrice + product.flipkartPrice) / 2;
        // Simple value index: higher rating with lower average price gets a higher value score
        const valueScore = product.rating / (avgPrice / 10000); 
        if (valueScore > bestValueScore) {
          bestValueScore = valueScore;
          bestValueProduct = product;
        }

        if (product.rating > highestRating) {
          highestRating = product.rating;
          premiumProduct = product;
        }
      });

      // Construct dummy AI reviews analysis and response structure
      const mockRecommendation = `### Algorithmic AI Analysis (No Gemini API Key found)

Based on our smart heuristics, we analyzed the ${compareList.length} products you selected:

1. **Best Value Winner:** **${bestValueProduct.name}**
   - It offers a highly competitive price starting at ₹${Math.min(bestValueProduct.amazonPrice, bestValueProduct.flipkartPrice).toLocaleString()} and boasts an impressive rating of **${bestValueProduct.rating}/5**. It yields the most performance per Rupee spent.

2. **Premium/Performance Winner:** **${premiumProduct.name}**
   - With an outstanding rating of **${premiumProduct.rating}/5**, this choice represents top-tier quality and design. If price is not your primary blocker, this is the superior option.

3. **Buying Recommendation Summary:**
   - For budget-conscious buyers, **${bestValueProduct.name}** is the smarter buy.
   - If your preferences lean towards **${userPreference || "overall performance"}**, we suggest going with **${premiumProduct.name}**, as it holds higher satisfaction scores for specs and customer reviews.
   - We compared prices between Amazon and Flipkart. Currently, **${bestValueProduct.amazonPrice <= bestValueProduct.flipkartPrice ? "Amazon" : "Flipkart"}** offers the lowest rate for ${bestValueProduct.name}.`;

      res.json({
        recommendation: mockRecommendation,
        bestValueId: bestValueProduct.id,
        premiumId: premiumProduct.id,
        isFallback: true,
      });
      return;
    }

    // Construct highly structured data for Gemini context
    const productsContext = compareList.map((product) => {
      const minPrice = Math.min(product.amazonPrice, product.flipkartPrice);
      const cheapestStore = product.amazonPrice <= product.flipkartPrice ? "Amazon" : "Flipkart";
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        amazonPrice: product.amazonPrice,
        flipkartPrice: product.flipkartPrice,
        cheapestPrice: minPrice,
        cheapestStore,
        rating: product.rating,
        specs: product.specs,
        reviewsSummary: product.reviews.map(r => `[${r.rating}*] ${r.text}`).join(" | ")
      };
    });

    const prompt = `You are an elite, objective AI shopping assistant. Your goal is to compare the selected products and recommend the best choice based on their price, specifications, ratings, user reviews, and custom user preference.

Products to compare:
${JSON.stringify(productsContext, null, 2)}

User Preference: "${userPreference || "Overall best option"}"

Generate a highly structured Markdown analysis. You MUST include:
1. An objective breakdown comparing these products side-by-side.
2. A clear winner for "Best Value For Money" (factoring in average price and features). Specify the exact product ID of this winner in double asterisks, e.g. "ValueWinner: [id]".
3. A clear winner for "Premium Choice/Highest Performance". Specify the exact product ID of this winner, e.g. "PremiumWinner: [id]".
4. A customized final buying guidance based on the user preference: "${userPreference}".
5. Price discovery note explaining where to buy each selected product cheaper.

Make your tone helpful, technical, direct, and beginner-friendly. Do not use generic pleasantries, write a solid, data-rich analytical answer.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const aiResponseText = response.text || "Failed to generate AI response. Try again later.";

    // Parse the winner IDs from the generated text if possible (using simple regex helper), otherwise fallback
    let bestValueId = compareList[0].id;
    let premiumId = compareList[compareList.length - 1].id;

    const valueMatch = aiResponseText.match(/ValueWinner:\s*\[?([a-zA-Z0-9-]+)\]?/i);
    if (valueMatch && compareList.some(p => p.id === valueMatch[1])) {
      bestValueId = valueMatch[1];
    }
    const premiumMatch = aiResponseText.match(/PremiumWinner:\s*\[?([a-zA-Z0-9-]+)\]?/i);
    if (premiumMatch && compareList.some(p => p.id === premiumMatch[1])) {
      premiumId = premiumMatch[1];
    }

    res.json({
      recommendation: aiResponseText,
      bestValueId,
      premiumId,
      isFallback: false,
    });
  } catch (error: any) {
    console.error("AI Recommend error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

/**
 * Endpoint: POST /api/products/scan-file
 * Purpose: Analyzes product receipts/screenshots using Gemini multi-modal scanning,
 *          or returns matched inventory.
 */
app.post("/api/products/scan-file", async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileData, mimeType, fileName } = req.body;

    if (!fileData || !mimeType) {
      res.status(400).json({ error: "Missing fileData (base64 string) or mimeType" });
      return;
    }

    const ai = getGeminiClient();

    let extractedData = {
      productName: "",
      category: "Other",
      specs: {} as Record<string, string>,
      detectedPrice: 0,
    };

    if (!ai) {
      // Robust simulated parsing fallback based on file name or content type
      const lowerName = (fileName || "").toLowerCase();
      
      if (lowerName.includes("iphone") || lowerName.includes("apple") || lowerName.includes("phone")) {
        extractedData = {
          productName: "Apple iPhone 15",
          category: "Smartphones",
          specs: {
            "Display": "6.1 inches Super Retina XDR",
            "Processor": "Apple A16 Bionic",
            "RAM": "6 GB"
          },
          detectedPrice: 69999
        };
      } else if (lowerName.includes("macbook") || lowerName.includes("laptop") || lowerName.includes("asus") || lowerName.includes("rog")) {
        extractedData = {
          productName: "Apple MacBook Air M3",
          category: "Laptops",
          specs: {
            "Display": "13.6-inch Liquid Retina",
            "Processor": "Apple M3 (8-core)",
            "RAM": "8 GB"
          },
          detectedPrice: 102990
        };
      } else if (lowerName.includes("sony") || lowerName.includes("headphone") || lowerName.includes("ear") || lowerName.includes("audio")) {
        extractedData = {
          productName: "Sony WH-1000XM5 ANC",
          category: "Audio",
          specs: {
            "Noise Cancellation": "Dual Processor V1 + QN1 HD ANC",
            "Battery Life": "Up to 30 hours",
            "Bluetooth": "Bluetooth 5.2"
          },
          detectedPrice: 27990
        };
      } else {
        extractedData = {
          productName: "Apple Watch Series 9 GPS",
          category: "Smartwatches",
          specs: {
            "Display": "Always-On Retina OLED",
            "Processor": "Apple S9 SiP",
            "Battery": "Up to 18 hours"
          },
          detectedPrice: 35999
        };
      }
    } else {
      // Use real Gemini API
      // fileData is expected to be base64 string
      const base64Data = fileData.split(",")[1] || fileData;

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };

      const prompt = `You are an expert AI product receipt and screenshot analyzer.
Analyze the uploaded image (which could be a receipt, storefront screenshot, product detail page, or invoice).
Identify the key product mentioned or shown in the image.
Extract the following information and return it STRICTLY in JSON format matching this schema:
{
  "productName": "string (the clean brand and model name)",
  "category": "Smartphones" | "Laptops" | "Audio" | "Smartwatches" | "Other",
  "specs": {
    "key1": "value1",
    "key2": "value2",
    "key3": "value3"
  },
  "detectedPrice": number (estimated lowest price found in the image in INR/Rupees, or 0 if not found)
}

Only return the JSON block, no markdown formatting (no \`\`\`json blocks), just pure raw JSON string.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, { text: prompt }] },
      });

      const text = response.text || "";
      try {
        // Clean markdown backticks if Gemini accidentally outputted them
        const cleanedText = text.replace(/```json/i, "").replace(/```/, "").trim();
        extractedData = JSON.parse(cleanedText);
      } catch (jsonErr) {
        console.error("Failed to parse Gemini JSON output, falling back to regex extraction:", text);
        // Soft regex parsing fallback
        const nameMatch = text.match(/"productName"\s*:\s*"([^"]+)"/);
        const catMatch = text.match(/"category"\s*:\s*"([^"]+)"/);
        extractedData = {
          productName: nameMatch ? nameMatch[1] : "Scanned Product",
          category: (catMatch ? catMatch[1] : "Other") as any,
          specs: { "Info": "Scanned specifications details" },
          detectedPrice: 0
        };
      }
    }

    // Attempt to find a matching product in our current system inventory PRODUCTS
    const searchTerms = extractedData.productName.toLowerCase().split(" ");
    let matchedProduct = PRODUCTS.find((p) => {
      // Check if product name fully or mostly contains search terms
      return searchTerms.every((term) => {
        if (term.length <= 2) return true; // skip small words
        return p.name.toLowerCase().includes(term);
      });
    });

    // If no perfect match found, check for category-based matches
    if (!matchedProduct) {
      matchedProduct = PRODUCTS.find((p) => p.category.toLowerCase() === extractedData.category.toLowerCase());
    }

    res.json({
      success: true,
      extracted: extractedData,
      matchedProduct: matchedProduct || null,
      isFallback: !ai,
    });
  } catch (error: any) {
    console.error("Scan file error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

/**
 * Endpoint: GET /api/user/history
 * Purpose: Returns past searches for the logged-in user.
 */
app.get("/api/user/history", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = await readDb();
    const userHistory = db.history
      .filter((h) => h.userEmail.toLowerCase() === req.userEmail?.toLowerCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(userHistory);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Endpoint: DELETE /api/user/history
 * Purpose: Clears search history log for the active user.
 */
app.delete("/api/user/history", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = await readDb();
    db.history = db.history.filter((h) => h.userEmail.toLowerCase() !== req.userEmail?.toLowerCase());
    await writeDb(db);

    res.json({ success: true, message: "Search history cleared!" });
  } catch (error) {
    console.error("Delete history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Setup static file hosting and dev server orchestration.
 */
async function startServer() {
  // Check if the compiled dist folder exists
  const distExists = await fs.access(path.join(process.cwd(), "dist"))
    .then(() => true)
    .catch(() => false);

  // Vite dev server integration for HMR or SPA Fallbacks
  if (process.env.NODE_ENV !== "production" || !distExists) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    // Standard Production deployment builds static file serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files mounted for deployment.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Price Comparison application running at http://0.0.0.0:${PORT}`);
  });
}

// Start the fullstack Express application
startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
