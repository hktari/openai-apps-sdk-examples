import express from "express";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static assets from ./assets directory
app.use(
  express.static(join(__dirname, "assets"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// MCP server endpoint - this will proxy to the actual MCP server
app.post("/mcp", express.json(), (req, res) => {
  // For now, return a simple response
  // In a real implementation, you'd spawn and communicate with the MCP server
  res.json({
    jsonrpc: "2.0",
    id: req.body.id || null,
    result: {
      content: [
        {
          type: "text",
          text: "MCP server is running on Railway",
        },
      ],
    },
  });
});

// Catch-all handler to serve the main HTML files
app.get("/:name.html", (req, res) => {
  const fileName = req.params.name;
  res.sendFile(join(__dirname, "assets", `${fileName}.html`));
});

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "OpenAI Apps SDK on Railway",
    endpoints: {
      static: "/cobiss-search.html",
      mcp: "/mcp",
      health: "/health",
    },
  });
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Static assets: http://localhost:${PORT}/`);
  console.log(`🔧 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

export default app;
