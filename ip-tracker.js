/**
 * IP Visit Tracker Module
 * Tracks visitor IP addresses and basic geolocation data
 * Compatible with GitHub Pages static hosting
 */

class IPTracker {
    constructor(options = {}) {
        this.options = {
            // Configuration options
            enableGeolocation: options.enableGeolocation !== false,
            enableLocalStorage: options.enableLocalStorage !== false,
            apiEndpoint: options.apiEndpoint || 'https://ipapi.co/json/',
            fallbackEndpoint: options.fallbackEndpoint || 'https://api.ipify.org?format=json',
            storageKey: options.storageKey || 'visitor_tracking_data',
            maxStoredVisits: options.maxStoredVisits || 100,
            trackingEnabled: options.trackingEnabled !== false,
            debugMode: options.debugMode || false,
            ...options
        };
        
        this.visitData = {
            visits: [],
            totalVisits: 0,
            uniqueVisitors: new Set(),
            countries: {},
            cities: {},
            lastVisit: null
        };
        
        this.init();
    }
    
    async init() {
        if (!this.options.trackingEnabled) {
            this.log('IP tracking is disabled');
            return;
        }
        
        try {
            this.log('Initializing IP tracker...');
            
            // Load existing data
            this.loadStoredData();
            this.log('Loaded existing data:', this.visitData);
            
            // Track current visit
            await this.trackCurrentVisit();
            this.log('Current visit tracked');
            
            // Save updated data
            this.saveData();
            this.log('Data saved to localStorage');
            
            // Display stats if in debug mode
            if (this.options.debugMode) {
                this.displayStats();
            }
            
            // Make tracker globally accessible for debugging
            window.ipTrackerInstance = this;
            this.log('IP tracker initialized successfully');
            
        } catch (error) {
            this.log('Error initializing IP tracker:', error);
            console.error('IP Tracker Error:', error);
        }
    }
    
    async trackCurrentVisit() {
        try {
            const visitInfo = await this.getVisitorInfo();
            
            // Check if this is a unique visitor (based on IP)
            const isUniqueVisitor = !this.visitData.uniqueVisitors.has(visitInfo.ip);
            
            // Add to unique visitors set
            this.visitData.uniqueVisitors.add(visitInfo.ip);
            
            // Create visit record
            const visitRecord = {
                timestamp: new Date().toISOString(),
                ip: visitInfo.ip,
                country: visitInfo.country || 'Unknown',
                city: visitInfo.city || 'Unknown',
                region: visitInfo.region || 'Unknown',
                timezone: visitInfo.timezone || 'Unknown',
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'Direct',
                isUniqueVisitor: isUniqueVisitor,
                sessionId: this.generateSessionId()
            };
            
            // Add to visits array
            this.visitData.visits.push(visitRecord);
            
            // Update counters
            this.visitData.totalVisits++;
            this.visitData.lastVisit = visitRecord.timestamp;
            
            // Update country/city stats
            this.updateLocationStats(visitRecord.country, visitRecord.city);
            
            // Limit stored visits to prevent excessive storage usage
            if (this.visitData.visits.length > this.options.maxStoredVisits) {
                this.visitData.visits = this.visitData.visits.slice(-this.options.maxStoredVisits);
            }
            
            this.log('Visit tracked:', visitRecord);
            
        } catch (error) {
            this.log('Error tracking visit:', error);
        }
    }
    
    async getVisitorInfo() {
        try {
            // Try primary API endpoint
            const response = await fetch(this.options.apiEndpoint);
            if (response.ok) {
                const data = await response.json();
                return {
                    ip: data.ip,
                    country: data.country_name,
                    city: data.city,
                    region: data.region,
                    timezone: data.timezone
                };
            }
        } catch (error) {
            this.log('Primary API failed, trying fallback:', error);
        }
        
        try {
            // Fallback to simple IP-only service
            const response = await fetch(this.options.fallbackEndpoint);
            if (response.ok) {
                const data = await response.json();
                return {
                    ip: data.ip,
                    country: null,
                    city: null,
                    region: null,
                    timezone: null
                };
            }
        } catch (error) {
            this.log('Fallback API also failed:', error);
        }
        
        // If all APIs fail, return minimal data
        return {
            ip: 'Unknown',
            country: null,
            city: null,
            region: null,
            timezone: null
        };
    }
    
    updateLocationStats(country, city) {
        // Update country stats
        if (country && country !== 'Unknown') {
            this.visitData.countries[country] = (this.visitData.countries[country] || 0) + 1;
        }
        
        // Update city stats
        if (city && city !== 'Unknown') {
            this.visitData.cities[city] = (this.visitData.cities[city] || 0) + 1;
        }
    }
    
    loadStoredData() {
        if (!this.options.enableLocalStorage) return;
        
        try {
            const stored = localStorage.getItem(this.options.storageKey);
            if (stored) {
                const parsedData = JSON.parse(stored);
                this.visitData = {
                    ...this.visitData,
                    ...parsedData,
                    uniqueVisitors: new Set(parsedData.uniqueVisitors || [])
                };
            }
        } catch (error) {
            this.log('Error loading stored data:', error);
        }
    }
    
    saveData() {
        if (!this.options.enableLocalStorage) {
            this.log('Local storage disabled, skipping save');
            return;
        }
        
        try {
            const dataToStore = {
                ...this.visitData,
                uniqueVisitors: Array.from(this.visitData.uniqueVisitors)
            };
            
            const jsonString = JSON.stringify(dataToStore);
            localStorage.setItem(this.options.storageKey, jsonString);
            
            // Verify the data was saved correctly
            const verification = localStorage.getItem(this.options.storageKey);
            if (verification) {
                this.log('Data saved successfully to localStorage. Size:', jsonString.length, 'characters');
                this.log('Verification successful. Stored data exists.');
            } else {
                this.log('Warning: Data save verification failed');
            }
            
        } catch (error) {
            this.log('Error saving data:', error);
            console.error('IP Tracker Save Error:', error);
            
            // Try to save minimal data if full save fails
            try {
                const minimalData = {
                    totalVisits: this.visitData.totalVisits,
                    uniqueVisitors: Array.from(this.visitData.uniqueVisitors),
                    lastVisit: this.visitData.lastVisit
                };
                localStorage.setItem(this.options.storageKey + '_minimal', JSON.stringify(minimalData));
                this.log('Minimal data saved as fallback');
            } catch (fallbackError) {
                this.log('Fallback save also failed:', fallbackError);
            }
        }
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Public methods for accessing data
    getStats() {
        return {
            totalVisits: this.visitData.totalVisits,
            uniqueVisitors: this.visitData.uniqueVisitors.size,
            countries: this.visitData.countries,
            cities: this.visitData.cities,
            lastVisit: this.visitData.lastVisit,
            recentVisits: this.visitData.visits.slice(-10) // Last 10 visits
        };
    }
    
    getVisitHistory() {
        return this.visitData.visits;
    }
    
    exportData() {
        const exportData = {
            ...this.visitData,
            uniqueVisitors: Array.from(this.visitData.uniqueVisitors),
            exportedAt: new Date().toISOString()
        };
        
        // Create downloadable JSON file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visitor_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    clearData() {
        this.visitData = {
            visits: [],
            totalVisits: 0,
            uniqueVisitors: new Set(),
            countries: {},
            cities: {},
            lastVisit: null
        };
        
        if (this.options.enableLocalStorage) {
            localStorage.removeItem(this.options.storageKey);
        }
        
        this.log('All tracking data cleared');
    }
    
    displayStats() {
        const stats = this.getStats();
        console.group('📊 Website Visit Statistics');
        console.log('Total Visits:', stats.totalVisits);
        console.log('Unique Visitors:', stats.uniqueVisitors);
        console.log('Top Countries:', Object.entries(stats.countries).sort((a, b) => b[1] - a[1]).slice(0, 5));
        console.log('Top Cities:', Object.entries(stats.cities).sort((a, b) => b[1] - a[1]).slice(0, 5));
        console.log('Last Visit:', stats.lastVisit);
        console.groupEnd();
    }
    
    // Admin panel creation
    createAdminPanel() {
        const panel = document.createElement('div');
        panel.id = 'ip-tracker-admin';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 12px;
            max-width: 300px;
            display: none;
        `;
        
        const stats = this.getStats();
        panel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #333;">📊 Visit Stats</h3>
            <p><strong>Total Visits:</strong> ${stats.totalVisits}</p>
            <p><strong>Unique Visitors:</strong> ${stats.uniqueVisitors}</p>
            <p><strong>Last Visit:</strong> ${stats.lastVisit ? new Date(stats.lastVisit).toLocaleString() : 'None'}</p>
            <div style="margin-top: 10px;">
                <button onclick="window.ipTracker.exportData()" style="margin-right: 5px; padding: 5px 10px; font-size: 11px;">Export Data</button>
                <button onclick="window.ipTracker.clearData(); location.reload();" style="padding: 5px 10px; font-size: 11px; background: #ff4444; color: white; border: none;">Clear Data</button>
            </div>
            <button onclick="document.getElementById('ip-tracker-admin').style.display='none'" style="position: absolute; top: 5px; right: 8px; background: none; border: none; font-size: 16px; cursor: pointer;">×</button>
        `;
        
        document.body.appendChild(panel);
        
        // Add keyboard shortcut to show/hide panel (Ctrl+Shift+I)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                const panel = document.getElementById('ip-tracker-admin');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                }
            }
        });
    }
    
    log(...args) {
        if (this.options.debugMode) {
            console.log('[IP Tracker]', ...args);
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with default options - debug mode enabled for troubleshooting
    window.ipTracker = new IPTracker({
        debugMode: true, // Temporarily enabled for debugging
        trackingEnabled: true,
        enableGeolocation: true,
        enableLocalStorage: true
    });
    
    // Create admin panel for site owner
    // Uncomment the next line if you want the admin panel
    // window.ipTracker.createAdminPanel();
    
    // Add a simple way to check if tracking is working
    setTimeout(() => {
        const stats = window.ipTracker.getStats();
        console.log('🔍 IP Tracker Status Check:', {
            totalVisits: stats.totalVisits,
            uniqueVisitors: stats.uniqueVisitors,
            dataInStorage: !!localStorage.getItem('visitor_tracking_data')
        });
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPTracker;
}
