/**
 * Enhanced IP Visit Tracker Module
 * Comprehensive visitor analytics with detailed device, browser, and behavior tracking
 */

class EnhancedIPTracker {
    constructor(options = {}) {
        this.options = {
            enableGeolocation: options.enableGeolocation !== false,
            enableLocalStorage: options.enableLocalStorage !== false,
            enableBehaviorTracking: options.enableBehaviorTracking !== false,
            enablePerformanceTracking: options.enablePerformanceTracking !== false,
            apiEndpoint: options.apiEndpoint || 'https://ipapi.co/json/',
            fallbackEndpoint: options.fallbackEndpoint || 'https://api.ipify.org?format=json',
            storageKey: options.storageKey || 'enhanced_visitor_tracking_data',
            maxStoredVisits: options.maxStoredVisits || 100,
            trackingEnabled: options.trackingEnabled !== false,
            debugMode: options.debugMode || false,
            ...options
        };
        
        this.visitData = {
            visits: [],
            totalVisits: 0,
            uniqueVisitors: new Set(),
            sessions: {},
            analytics: {
                devices: {},
                browsers: {},
                operatingSystems: {},
                countries: {},
                cities: {},
                referrers: {},
                languages: {},
                screenResolutions: {},
                connectionTypes: {}
            },
            lastVisit: null
        };
        
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            pageViews: 0,
            interactions: [],
            scrollDepth: 0,
            timeOnPage: 0
        };
        
        this.init();
    }
    
    async init() {
        if (!this.options.trackingEnabled) {
            this.log('Enhanced tracking is disabled');
            return;
        }
        
        try {
            this.log('Initializing enhanced IP tracker...');
            
            // Load existing data
            this.loadStoredData();
            
            // Set up behavior tracking
            if (this.options.enableBehaviorTracking) {
                this.setupBehaviorTracking();
            }
            
            // Track current visit with enhanced data
            await this.trackEnhancedVisit();
            
            // Save updated data
            this.saveData();
            
            // Display stats if in debug mode
            if (this.options.debugMode) {
                this.displayEnhancedStats();
            }
            
            // Make tracker globally accessible
            window.enhancedIPTracker = this;
            this.log('Enhanced IP tracker initialized successfully');
            
        } catch (error) {
            this.log('Error initializing enhanced IP tracker:', error);
            console.error('Enhanced IP Tracker Error:', error);
        }
    }
    
    async trackEnhancedVisit() {
        try {
            // Get basic visitor info
            const visitorInfo = await this.getVisitorInfo();
            
            // Get enhanced device and browser info
            const deviceInfo = this.getDeviceInfo();
            const browserInfo = this.getBrowserInfo();
            const performanceInfo = this.getPerformanceInfo();
            const environmentInfo = this.getEnvironmentInfo();
            const behaviorInfo = this.getBehaviorInfo();
            
            // Check if this is a unique visitor
            const isUniqueVisitor = !this.visitData.uniqueVisitors.has(visitorInfo.ip);
            this.visitData.uniqueVisitors.add(visitorInfo.ip);
            
            // Create comprehensive visit record
            const visitRecord = {
                // Basic info
                timestamp: new Date().toISOString(),
                sessionId: this.sessionData.sessionId,
                ip: visitorInfo.ip,
                isUniqueVisitor: isUniqueVisitor,
                
                // Location data
                location: {
                    country: visitorInfo.country || 'Unknown',
                    city: visitorInfo.city || 'Unknown',
                    region: visitorInfo.region || 'Unknown',
                    timezone: visitorInfo.timezone || 'Unknown',
                    latitude: visitorInfo.latitude || null,
                    longitude: visitorInfo.longitude || null
                },
                
                // Device information
                device: deviceInfo,
                
                // Browser information
                browser: browserInfo,
                
                // Performance metrics
                performance: performanceInfo,
                
                // Environment details
                environment: environmentInfo,
                
                // Behavior data
                behavior: behaviorInfo,
                
                // Page context
                page: {
                    url: window.location.href,
                    title: document.title,
                    referrer: document.referrer || 'Direct',
                    pathname: window.location.pathname,
                    search: window.location.search,
                    hash: window.location.hash
                }
            };
            
            // Add to visits array
            this.visitData.visits.push(visitRecord);
            this.visitData.totalVisits++;
            this.visitData.lastVisit = visitRecord.timestamp;
            
            // Update analytics
            this.updateAnalytics(visitRecord);
            
            // Update session data
            this.sessionData.pageViews++;
            
            // Limit stored visits
            if (this.visitData.visits.length > this.options.maxStoredVisits) {
                this.visitData.visits = this.visitData.visits.slice(-this.options.maxStoredVisits);
            }
            
            this.log('Enhanced visit tracked:', visitRecord);
            
        } catch (error) {
            this.log('Error tracking enhanced visit:', error);
        }
    }
    
    getDeviceInfo() {
        const ua = navigator.userAgent;
        
        return {
            type: this.getDeviceType(ua),
            isMobile: /Mobile|Android|iPhone|iPad/.test(ua),
            isTablet: /iPad|Android(?!.*Mobile)/.test(ua),
            isDesktop: !/Mobile|Android|iPhone|iPad/.test(ua),
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                resolution: `${screen.width}x${screen.height}`
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                size: `${window.innerWidth}x${window.innerHeight}`
            },
            pixelRatio: window.devicePixelRatio || 1,
            touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            orientation: screen.orientation ? screen.orientation.type : 'unknown'
        };
    }
    
    getBrowserInfo() {
        const ua = navigator.userAgent;
        
        return {
            name: this.getBrowserName(ua),
            version: this.getBrowserVersion(ua),
            userAgent: ua,
            language: navigator.language,
            languages: navigator.languages || [navigator.language],
            platform: navigator.platform,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack === '1',
            onlineStatus: navigator.onLine,
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            plugins: Array.from(navigator.plugins || []).map(p => p.name),
            mimeTypes: Array.from(navigator.mimeTypes || []).map(m => m.type)
        };
    }
    
    getPerformanceInfo() {
        if (!this.options.enablePerformanceTracking || !window.performance) {
            return null;
        }
        
        const timing = performance.timing;
        const navigation = performance.navigation;
        
        return {
            // Load times (in milliseconds)
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            domContentLoadedTime: timing.domContentLoaded - timing.navigationStart,
            domInteractiveTime: timing.domInteractive - timing.navigationStart,
            firstByteTime: timing.responseStart - timing.navigationStart,
            
            // Navigation info
            navigationType: navigation.type, // 0=navigate, 1=reload, 2=back/forward
            redirectCount: navigation.redirectCount,
            
            // Connection info (if available)
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : null,
            
            // Memory info (Chrome only)
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }
    
    getEnvironmentInfo() {
        return {
            protocol: location.protocol,
            isSecure: location.protocol === 'https:',
            port: location.port || (location.protocol === 'https:' ? 443 : 80),
            
            // Feature support
            features: {
                localStorage: typeof(Storage) !== 'undefined',
                sessionStorage: typeof(sessionStorage) !== 'undefined',
                webGL: !!document.createElement('canvas').getContext('webgl'),
                webRTC: !!window.RTCPeerConnection,
                serviceWorker: 'serviceWorker' in navigator,
                geolocation: 'geolocation' in navigator,
                notifications: 'Notification' in window,
                webSockets: 'WebSocket' in window,
                webWorkers: 'Worker' in window,
                indexedDB: 'indexedDB' in window,
                canvas: !!document.createElement('canvas').getContext,
                svg: !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect
            },
            
            // Timezone info
            timezone: {
                name: Intl.DateTimeFormat().resolvedOptions().timeZone,
                offset: new Date().getTimezoneOffset(),
                offsetString: new Date().toString().match(/GMT[+-]\d{4}/)?.[0] || 'Unknown'
            }
        };
    }
    
    getBehaviorInfo() {
        return {
            scrollDepth: this.sessionData.scrollDepth,
            timeOnPage: Date.now() - this.sessionData.startTime,
            interactions: this.sessionData.interactions.length,
            pageViews: this.sessionData.pageViews,
            isNewSession: this.sessionData.pageViews === 1,
            
            // Document state
            documentState: {
                readyState: document.readyState,
                hidden: document.hidden,
                visibilityState: document.visibilityState
            }
        };
    }
    
    setupBehaviorTracking() {
        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
                this.sessionData.scrollDepth = Math.min(maxScrollDepth, 100);
            }
        });
        
        // Track clicks
        document.addEventListener('click', (e) => {
            this.sessionData.interactions.push({
                type: 'click',
                timestamp: Date.now(),
                element: e.target.tagName,
                x: e.clientX,
                y: e.clientY
            });
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.sessionData.interactions.push({
                type: 'visibility',
                timestamp: Date.now(),
                hidden: document.hidden
            });
        });
        
        // Track beforeunload (page exit)
        window.addEventListener('beforeunload', () => {
            this.sessionData.timeOnPage = Date.now() - this.sessionData.startTime;
            this.saveData(); // Save data before page unload
        });
    }
    
    updateAnalytics(visitRecord) {
        const analytics = this.visitData.analytics;
        
        // Update device analytics
        const deviceType = visitRecord.device.type;
        analytics.devices[deviceType] = (analytics.devices[deviceType] || 0) + 1;
        
        // Update browser analytics
        const browserName = visitRecord.browser.name;
        analytics.browsers[browserName] = (analytics.browsers[browserName] || 0) + 1;
        
        // Update OS analytics
        const platform = visitRecord.browser.platform;
        analytics.operatingSystems[platform] = (analytics.operatingSystems[platform] || 0) + 1;
        
        // Update location analytics
        const country = visitRecord.location.country;
        const city = visitRecord.location.city;
        if (country !== 'Unknown') {
            analytics.countries[country] = (analytics.countries[country] || 0) + 1;
        }
        if (city !== 'Unknown') {
            analytics.cities[city] = (analytics.cities[city] || 0) + 1;
        }
        
        // Update referrer analytics
        const referrer = visitRecord.page.referrer;
        if (referrer !== 'Direct') {
            try {
                const referrerDomain = new URL(referrer).hostname;
                analytics.referrers[referrerDomain] = (analytics.referrers[referrerDomain] || 0) + 1;
            } catch (e) {
                analytics.referrers['Unknown'] = (analytics.referrers['Unknown'] || 0) + 1;
            }
        } else {
            analytics.referrers['Direct'] = (analytics.referrers['Direct'] || 0) + 1;
        }
        
        // Update language analytics
        const language = visitRecord.browser.language;
        analytics.languages[language] = (analytics.languages[language] || 0) + 1;
        
        // Update screen resolution analytics
        const resolution = visitRecord.device.screen.resolution;
        analytics.screenResolutions[resolution] = (analytics.screenResolutions[resolution] || 0) + 1;
        
        // Update connection type analytics
        if (visitRecord.performance?.connection?.effectiveType) {
            const connectionType = visitRecord.performance.connection.effectiveType;
            analytics.connectionTypes[connectionType] = (analytics.connectionTypes[connectionType] || 0) + 1;
        }
    }
    
    // Utility methods
    getDeviceType(ua) {
        if (/iPad/.test(ua)) return 'tablet';
        if (/Mobile|Android|iPhone/.test(ua)) return 'mobile';
        return 'desktop';
    }
    
    getBrowserName(ua) {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('Opera')) return 'Opera';
        return 'Unknown';
    }
    
    getBrowserVersion(ua) {
        const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/);
        return match ? match[2] : 'Unknown';
    }
    
    // Enhanced stats display
    displayEnhancedStats() {
        const stats = this.getEnhancedStats();
        console.group('📊 Enhanced Website Analytics');
        console.log('📈 Basic Stats:', {
            totalVisits: stats.totalVisits,
            uniqueVisitors: stats.uniqueVisitors,
            lastVisit: stats.lastVisit
        });
        console.log('📱 Device Breakdown:', stats.analytics.devices);
        console.log('🌐 Browser Breakdown:', stats.analytics.browsers);
        console.log('🌍 Top Countries:', Object.entries(stats.analytics.countries).sort((a, b) => b[1] - a[1]).slice(0, 5));
        console.log('🔗 Top Referrers:', Object.entries(stats.analytics.referrers).sort((a, b) => b[1] - a[1]).slice(0, 5));
        console.log('💻 Screen Resolutions:', stats.analytics.screenResolutions);
        console.groupEnd();
    }
    
    getEnhancedStats() {
        return {
            totalVisits: this.visitData.totalVisits,
            uniqueVisitors: this.visitData.uniqueVisitors.size,
            analytics: this.visitData.analytics,
            lastVisit: this.visitData.lastVisit,
            recentVisits: this.visitData.visits.slice(-10),
            sessionInfo: this.sessionData
        };
    }
    
    // Inherit other methods from base class
    async getVisitorInfo() {
        try {
            const response = await fetch(this.options.apiEndpoint);
            if (response.ok) {
                const data = await response.json();
                return {
                    ip: data.ip,
                    country: data.country_name,
                    city: data.city,
                    region: data.region,
                    timezone: data.timezone,
                    latitude: data.latitude,
                    longitude: data.longitude
                };
            }
        } catch (error) {
            this.log('Primary API failed, trying fallback:', error);
        }
        
        try {
            const response = await fetch(this.options.fallbackEndpoint);
            if (response.ok) {
                const data = await response.json();
                return {
                    ip: data.ip,
                    country: null,
                    city: null,
                    region: null,
                    timezone: null,
                    latitude: null,
                    longitude: null
                };
            }
        } catch (error) {
            this.log('Fallback API also failed:', error);
        }
        
        return {
            ip: 'Unknown',
            country: null,
            city: null,
            region: null,
            timezone: null,
            latitude: null,
            longitude: null
        };
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
        if (!this.options.enableLocalStorage) return;
        
        try {
            const dataToStore = {
                ...this.visitData,
                uniqueVisitors: Array.from(this.visitData.uniqueVisitors)
            };
            localStorage.setItem(this.options.storageKey, JSON.stringify(dataToStore));
            this.log('Enhanced data saved successfully');
        } catch (error) {
            this.log('Error saving enhanced data:', error);
        }
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    log(...args) {
        if (this.options.debugMode) {
            console.log('[Enhanced IP Tracker]', ...args);
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedIPTracker = new EnhancedIPTracker({
        debugMode: true,
        trackingEnabled: true,
        enableGeolocation: true,
        enableLocalStorage: true,
        enableBehaviorTracking: true,
        enablePerformanceTracking: true
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedIPTracker;
}
