// Import Express
const express = require('express');
// Create an Express app
const app = express();
// Import path module (for safe path handling)
const path = require('path');

const { spawn } = require('child_process');
 
// Define the port
const PORT = 3000;
 
// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'web')));
 
// Script hosting
app.get('/run/:script', (req, res) => {
    const scriptName = req.params.script;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const ps = spawn('powershell.exe', [
        '-ExecutionPolicy', 'Bypass', 
        '-File', `./Scripts/${scriptName}.ps1`
    ]);

    // Send data to the browser as it arrives
    ps.stdout.on('data', (data) => {
        res.write(`data: ${data.toString()}\n\n`);
    });

    ps.stderr.on('data', (data) => {
        res.write(`data: ERROR: ${data.toString()}\n\n`);
    });

    ps.on('close', (code) => {
        res.write(`data: [PROCESS COMPLETED WITH CODE ${code}]\n\n`);
        res.end(); // Close the stream
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});

