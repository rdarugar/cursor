const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { exec } = require('child_process');
const portfinder = require('portfinder');

// Kill any existing processes on the default port
const killExistingProcess = (port) => {
  return new Promise((resolve) => {
    exec(`lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`, (error) => {
      // Ignore errors as there might not be any process to kill
      resolve();
    });
  });
};

const startServer = async () => {
  const dev = process.env.NODE_ENV !== 'production';
  const app = next({ dev });
  const defaultPort = 3000;

  try {
    // Set the base port for searching
    portfinder.basePort = defaultPort;
    
    // Kill any existing process on the default port
    await killExistingProcess(defaultPort);

    // Find an available port
    const port = await portfinder.getPortPromise();

    await app.prepare();
    const handle = app.getRequestHandler();

    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`\n🚀 Ready on http://localhost:${port}`);
      console.log(`\n💻 Local Network: http://${getLocalIP()}:${port}\n`);
    });

  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

// Helper function to get local IP address
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '0.0.0.0';
}

startServer(); 