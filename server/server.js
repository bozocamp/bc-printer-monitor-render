const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Store printer data
let printerData = [];
let lastUpdate = null;

// Printer list
const printers = [
    { name: 'Oneill3rdfloorprinter01.bc.edu', ip: '136.167.67.130' },
    { name: 'Oneill3rdfloorprinter02.bc.edu', ip: '136.167.66.108' },
    { name: 'Oneill3rdfloorprinter03.bc.edu', ip: '136.167.67.32' },
    { name: 'Oneill3rdfloorprinter04.bc.edu', ip: '136.167.69.110' },
    { name: 'Oneill3rdfloorprinter05.bc.edu', ip: '136.167.69.140' },
    { name: 'oneill3rdfloorprinter06.bc.edu', ip: '136.167.66.240' },
    { name: 'oneill3rdfloorcolorprinter01.bc.edu', ip: '136.167.67.81' },
    { name: '2150comm.bc.edu', ip: '136.167.214.175' },
    { name: 'WIHD', ip: '136.167.66.220' }
];

// Demo data (always works)
function getDemoData() {
    return printers.map(printer => {
        const isColorPrinter = printer.name.toLowerCase().includes('color');
        const isOnline = true; // Always show online for demo
        
        return {
            name: printer.name,
            ip: printer.ip,
            status: 'online',
            reachable: true,
            toners: isColorPrinter ? [
                { color: 'Black', level: 65 },
                { color: 'Cyan', level: 45 },
                { color: 'Magenta', level: 55 },
                { color: 'Yellow', level: 35 }
            ] : [
                { color: 'Black', level: 75 }
            ],
            trays: [
                { name: 'Tray 1', status: 'OK' },
                { name: 'Tray 2', status: 'OK' },
                { name: 'Manual Feed', status: 'OK' }
            ],
            responseTime: 50,
            timestamp: new Date().toISOString(),
            method: 'demo'
        };
    });
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'BC Printer Monitor is running on Render',
        timestamp: new Date().toISOString(),
        printerCount: printers.length
    });
});

// Bridge data endpoint
app.post('/api/bridge-data', (req, res) => {
    try {
        console.log('📡 Received data from bridge server');
        const { printers } = req.body;
        
        if (printers && Array.isArray(printers)) {
            printerData = printers;
            lastUpdate = new Date().toISOString();
            console.log(`✅ Stored real data for ${printers.length} printers`);
            
            res.json({ 
                success: true, 
                message: `Received real data for ${printers.length} printers`,
                timestamp: lastUpdate
            });
        } else {
            res.status(400).json({ 
                success: false, 
                error: 'Invalid data format' 
            });
        }
    } catch (error) {
        console.error('❌ Error processing bridge data:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get printer data
app.get('/api/printers', (req, res) => {
    const data = printerData.length > 0 ? printerData : getDemoData();
    const onlineCount = data.filter(p => p.status === 'online').length;
    
    res.json({
        success: true,
        data: data,
        count: data.length,
        online: onlineCount,
        dataSource: printerData.length > 0 ? 'bridge-server' : 'demo',
        lastUpdate: lastUpdate,
        timestamp: new Date().toISOString()
    });
});

// POST endpoint for frontend
app.post('/api/printers/status', (req, res) => {
    const data = printerData.length > 0 ? printerData : getDemoData();
    
    res.json({
        success: true,
        data: data,
        dataSource: printerData.length > 0 ? 'bridge-server' : 'demo',
        lastUpdate: lastUpdate,
        timestamp: new Date().toISOString()
    });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 BC Printer Monitor running on port ${PORT}`);
    console.log(`📍 Ready for bridge server connections`);
    console.log(`🖨️  ${printers.length} printers configured`);
});
