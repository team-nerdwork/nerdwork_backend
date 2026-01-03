import { globalErrorHandler, globalNotFoundHandler } from "./middleware/common";
import type { Request, Response } from "express";
import { app } from "./server";
import authRoutes from "./routes/auth.routes";
import paymentRoutes from "./routes/payment.routes";
import { authenticate } from "./middleware/common/auth";
import nftRoutes from "./routes/nft.routes";
import walletRoutes from "./routes/wallet.routes";
import profileRoutes from "./routes/profile.routes";
import comicRoutes from "./routes/comic.routes";
import chapterRoutes from "./routes/chapter.routes";
import fileRoutes from "./routes/files.routes";
import libraryRoutes from "./routes/library.routes";
import transactionRoutes from "./routes/transaction.routes";
import nftRouterV2 from "./routes/anchor.nft.routes";
import marketplaceRoutes from "./routes/marketplace.routes";
import { AnchorConfig } from "./config/anchor.config";

const PORT = 5000;

/**
 * Initialize NFT services (Anchor + Marketplace)
 */
async function initializeNFTServices() {
  try {
    console.log("📍 Initializing NFT services...");
    await AnchorConfig.initializeAll();
    console.log("✓ NFT services initialized successfully");
    return true;
  } catch (error) {
    console.error("✗ Failed to initialize NFT services:", error);
    console.warn("⚠ Continuing without NFT services. Some endpoints may fail.");
    return false;
  }
}

/**
 * Register all routes
 */
function registerRoutes() {
  app.use("/auth", authRoutes);
  app.use("/payment", paymentRoutes);
  app.use("/nft", authenticate, nftRoutes);
  app.use("/wallet", authenticate, walletRoutes);
  app.use("/profile", profileRoutes);
  app.use("/comics", comicRoutes);
  app.use("/chapters", chapterRoutes);
  app.use("/file-upload", fileRoutes);
  app.use("/library", libraryRoutes);
  app.use("/transactions", transactionRoutes);
  app.use("/anchor-nft", nftRouterV2);
  app.use("/marketplace", marketplaceRoutes);
}

/**
 * Health check endpoint
 */
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ data: `Hello, world! - ${PORT}` });
});

/**
 * Server startup
 */
async function startServer() {
  try {
    // Initialize NFT services
    await initializeNFTServices();

    // Register routes
    registerRoutes();

    // Global error handlers
    app.use(globalNotFoundHandler);
    app.use(globalErrorHandler);

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running at http://localhost:${PORT}`);
      console.log(
        `📚 Swagger docs available at http://localhost:${PORT}/api-docs`
      );
      console.log(`\nAvailable endpoints:`);
      console.log(`  • NFT Minting: /api/anchor-nft`);
      console.log(`  • Marketplace: /api/marketplace`);
      console.log(`\n✓ Ready to accept requests\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

export { app };
