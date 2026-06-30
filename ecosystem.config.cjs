module.exports = {
  apps: [
    {
      name: "lees-chemicals",
      script: "./dist/server.cjs",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // GEMINI_API_KEY will be injected via GitHub Secrets or server environment
      }
    }
  ]
};
