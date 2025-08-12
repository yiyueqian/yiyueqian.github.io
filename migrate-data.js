/**
 * Data Migration Script
 * Migrates data from basic IP tracker to enhanced tracker format
 */

function migrateTrackerData() {
    const basicStorageKey = 'visitor_tracking_data';
    const enhancedStorageKey = 'enhanced_visitor_tracking_data';
    
    try {
        console.log('🔄 Starting data migration...');
        
        // Get existing basic data
        const basicData = localStorage.getItem(basicStorageKey);
        if (!basicData) {
            console.log('ℹ️ No basic tracker data found to migrate');
            return false;
        }
        
        const parsedBasicData = JSON.parse(basicData);
        console.log('📊 Found basic data:', {
            totalVisits: parsedBasicData.totalVisits,
            visits: parsedBasicData.visits?.length || 0,
            uniqueVisitors: parsedBasicData.uniqueVisitors?.length || 0
        });
        
        // Check if enhanced data already exists
        const existingEnhancedData = localStorage.getItem(enhancedStorageKey);
        if (existingEnhancedData) {
            const parsed = JSON.parse(existingEnhancedData);
            if (parsed.visits && parsed.visits.length > 0) {
                console.log('⚠️ Enhanced data already exists. Merging data...');
                return mergeData(parsedBasicData, parsed);
            }
        }
        
        // Convert basic data to enhanced format
        const enhancedData = convertBasicToEnhanced(parsedBasicData);
        
        // Save enhanced data
        localStorage.setItem(enhancedStorageKey, JSON.stringify(enhancedData));
        
        console.log('✅ Migration completed successfully!');
        console.log('📈 Enhanced data created:', {
            totalVisits: enhancedData.totalVisits,
            visits: enhancedData.visits.length,
            uniqueVisitors: enhancedData.uniqueVisitors.length
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        return false;
    }
}

function convertBasicToEnhanced(basicData) {
    const enhancedData = {
        visits: [],
        totalVisits: basicData.totalVisits || 0,
        uniqueVisitors: basicData.uniqueVisitors || [],
        sessions: {},
        analytics: {
            devices: {},
            browsers: {},
            operatingSystems: {},
            countries: basicData.countries || {},
            cities: basicData.cities || {},
            referrers: {},
            languages: {},
            screenResolutions: {},
            connectionTypes: {}
        },
        lastVisit: basicData.lastVisit
    };
    
    // Convert basic visits to enhanced format
    if (basicData.visits && Array.isArray(basicData.visits)) {
        enhancedData.visits = basicData.visits.map(basicVisit => {
            // Extract device info from user agent
            const deviceInfo = parseUserAgent(basicVisit.userAgent || '');
            
            // Create enhanced visit record
            const enhancedVisit = {
                // Basic info (preserved)
                timestamp: basicVisit.timestamp,
                sessionId: basicVisit.sessionId || generateSessionId(),
                ip: basicVisit.ip,
                isUniqueVisitor: basicVisit.isUniqueVisitor,
                
                // Location data (preserved and enhanced)
                location: {
                    country: basicVisit.country || 'Unknown',
                    city: basicVisit.city || 'Unknown',
                    region: basicVisit.region || 'Unknown',
                    timezone: basicVisit.timezone || 'Unknown',
                    latitude: null, // Will be filled by future visits
                    longitude: null
                },
                
                // Device information (inferred from user agent)
                device: {
                    type: deviceInfo.deviceType,
                    isMobile: deviceInfo.isMobile,
                    isTablet: deviceInfo.isTablet,
                    isDesktop: deviceInfo.isDesktop,
                    screen: {
                        width: null,
                        height: null,
                        resolution: 'Unknown'
                    },
                    viewport: {
                        width: null,
                        height: null,
                        size: 'Unknown'
                    },
                    pixelRatio: 1,
                    touchSupport: deviceInfo.isMobile || deviceInfo.isTablet,
                    orientation: 'unknown'
                },
                
                // Browser information (inferred from user agent)
                browser: {
                    name: deviceInfo.browserName,
                    version: deviceInfo.browserVersion,
                    userAgent: basicVisit.userAgent || '',
                    language: 'Unknown',
                    languages: [],
                    platform: deviceInfo.platform,
                    cookiesEnabled: true, // Assume true since they're using the site
                    doNotTrack: false,
                    onlineStatus: true
                },
                
                // Performance metrics (not available from basic data)
                performance: null,
                
                // Environment details (basic inference)
                environment: {
                    protocol: 'https:', // Assume HTTPS
                    isSecure: true,
                    port: 443,
                    features: {
                        localStorage: true, // Must be true since we're storing data
                        sessionStorage: true,
                        webGL: null,
                        webRTC: null,
                        serviceWorker: null
                    },
                    timezone: {
                        name: basicVisit.timezone || 'Unknown',
                        offset: null,
                        offsetString: 'Unknown'
                    }
                },
                
                // Behavior data (not available from basic data)
                behavior: {
                    scrollDepth: 0,
                    timeOnPage: 0,
                    interactions: 0,
                    pageViews: 1,
                    isNewSession: basicVisit.isUniqueVisitor,
                    documentState: {
                        readyState: 'complete',
                        hidden: false,
                        visibilityState: 'visible'
                    }
                },
                
                // Page context (inferred)
                page: {
                    url: 'https://yiyueqian.github.io/', // Assume main page
                    title: 'Yiyue Qian',
                    referrer: basicVisit.referrer || 'Direct',
                    pathname: '/',
                    search: '',
                    hash: ''
                }
            };
            
            return enhancedVisit;
        });
    }
    
    // Update analytics based on converted visits
    enhancedData.visits.forEach(visit => {
        updateAnalyticsFromVisit(enhancedData.analytics, visit);
    });
    
    return enhancedData;
}

function parseUserAgent(userAgent) {
    const ua = userAgent.toLowerCase();
    
    // Detect device type
    const isMobile = /mobile|android|iphone/.test(ua);
    const isTablet = /ipad|android(?!.*mobile)/.test(ua);
    const isDesktop = !isMobile && !isTablet;
    
    // Detect browser
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (ua.includes('chrome')) {
        browserName = 'Chrome';
        const match = ua.match(/chrome\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('firefox')) {
        browserName = 'Firefox';
        const match = ua.match(/firefox\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
        browserName = 'Safari';
        const match = ua.match(/version\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('edge')) {
        browserName = 'Edge';
        const match = ua.match(/edge\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
    }
    
    // Detect platform
    let platform = 'Unknown';
    if (ua.includes('windows')) platform = 'Windows';
    else if (ua.includes('mac')) platform = 'macOS';
    else if (ua.includes('linux')) platform = 'Linux';
    else if (ua.includes('android')) platform = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) platform = 'iOS';
    
    return {
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        isMobile,
        isTablet,
        isDesktop,
        browserName,
        browserVersion,
        platform
    };
}

function updateAnalyticsFromVisit(analytics, visit) {
    // Update device analytics
    const deviceType = visit.device.type;
    analytics.devices[deviceType] = (analytics.devices[deviceType] || 0) + 1;
    
    // Update browser analytics
    const browserName = visit.browser.name;
    analytics.browsers[browserName] = (analytics.browsers[browserName] || 0) + 1;
    
    // Update OS analytics
    const platform = visit.browser.platform;
    analytics.operatingSystems[platform] = (analytics.operatingSystems[platform] || 0) + 1;
    
    // Update referrer analytics
    const referrer = visit.page.referrer;
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
}

function mergeData(basicData, existingEnhancedData) {
    try {
        console.log('🔄 Merging basic and enhanced data...');
        
        // Add any new visits from basic data that aren't in enhanced data
        const enhancedTimestamps = new Set(existingEnhancedData.visits.map(v => v.timestamp));
        const newBasicVisits = basicData.visits.filter(v => !enhancedTimestamps.has(v.timestamp));
        
        if (newBasicVisits.length > 0) {
            console.log(`📊 Found ${newBasicVisits.length} new visits to merge`);
            
            // Convert new basic visits to enhanced format
            const convertedVisits = newBasicVisits.map(basicVisit => {
                const deviceInfo = parseUserAgent(basicVisit.userAgent || '');
                // ... (same conversion logic as above)
                return convertBasicVisitToEnhanced(basicVisit, deviceInfo);
            });
            
            // Add to existing enhanced data
            existingEnhancedData.visits.push(...convertedVisits);
            existingEnhancedData.totalVisits += newBasicVisits.length;
            
            // Update analytics
            convertedVisits.forEach(visit => {
                updateAnalyticsFromVisit(existingEnhancedData.analytics, visit);
            });
            
            // Save merged data
            localStorage.setItem('enhanced_visitor_tracking_data', JSON.stringify(existingEnhancedData));
            
            console.log('✅ Data merged successfully!');
            return true;
        } else {
            console.log('ℹ️ No new data to merge');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Merge failed:', error);
        return false;
    }
}

function generateSessionId() {
    return 'migrated_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Auto-run migration when script loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Checking for data migration...');
    migrateTrackerData();
});

// Export for manual use
window.migrateTrackerData = migrateTrackerData;
