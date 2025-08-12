# IP Visit Tracking System

This repository now includes a comprehensive IP visit tracking system that records visitor information while respecting privacy and working within GitHub Pages limitations.

## 🚀 Features

- **IP Address Tracking**: Records visitor IP addresses
- **Geolocation Data**: Captures country, city, and region information
- **Visit Statistics**: Tracks total visits, unique visitors, and visit patterns
- **Local Storage**: Data is stored in the browser's local storage
- **Privacy Compliant**: Works alongside your existing Google Analytics
- **Admin Dashboard**: Beautiful interface to view analytics
- **Data Export**: Export visitor data as JSON
- **Mobile Responsive**: Works on all devices

## 📁 Files Added

1. **`ip-tracker.js`** - Main tracking module
2. **`admin-dashboard.html`** - Analytics dashboard
3. **`IP_TRACKING_README.md`** - This documentation

## 🔧 Setup

The tracking system is already integrated into your website. Here's what was added to your `index.html`:

```html
<!-- IP Tracking Module -->
<script src="ip-tracker.js"></script>
```

## 📊 Viewing Analytics

### Method 1: Admin Dashboard
1. Open `admin-dashboard.html` in your browser
2. View comprehensive analytics including:
   - Total visits and unique visitors
   - Geographic distribution
   - Recent visit history
   - Export and data management options

### Method 2: Browser Console (for developers)
1. Open your website
2. Press F12 to open developer tools
3. In the console, type: `window.ipTracker.getStats()`
4. View detailed statistics

### Method 3: Keyboard Shortcut (if enabled)
1. On your website, press `Ctrl+Shift+I`
2. A small admin panel will appear in the top-right corner

## 🛠️ Configuration Options

You can customize the tracking behavior by modifying the initialization in `ip-tracker.js`:

```javascript
window.ipTracker = new IPTracker({
    debugMode: false,           // Set to true for development
    trackingEnabled: true,      // Enable/disable tracking
    enableGeolocation: true,    // Include location data
    enableLocalStorage: true,   // Store data locally
    maxStoredVisits: 100       // Maximum visits to store
});
```

## 📈 Data Collected

For each visit, the system records:
- **Timestamp**: When the visit occurred
- **IP Address**: Visitor's IP address
- **Location**: Country, city, region (if available)
- **User Agent**: Browser and device information
- **Referrer**: Where the visitor came from
- **Session ID**: Unique identifier for the visit
- **Unique Visitor Flag**: Whether this is a new visitor

## 🔒 Privacy Considerations

- **Local Storage Only**: Data is stored in the visitor's browser, not on external servers
- **No Personal Information**: Only IP addresses and general location data
- **Complements Google Analytics**: Works alongside your existing GA setup
- **User Control**: Visitors can clear their browser data to remove tracking

## 🚀 Deployment

1. **Commit the new files** to your GitHub repository:
   ```bash
   git add ip-tracker.js admin-dashboard.html IP_TRACKING_README.md index.html
   git commit -m "Add IP visit tracking system"
   git push origin main
   ```

2. **Access your analytics**:
   - Main site: `https://yiyueqian.github.io/`
   - Dashboard: `https://yiyueqian.github.io/admin-dashboard.html`

## 📱 Usage Examples

### Export Data
```javascript
// Export all visitor data as JSON file
window.ipTracker.exportData();
```

### Get Statistics
```javascript
// Get current statistics
const stats = window.ipTracker.getStats();
console.log('Total visits:', stats.totalVisits);
console.log('Unique visitors:', stats.uniqueVisitors);
```

### Clear Data
```javascript
// Clear all tracking data
window.ipTracker.clearData();
```

## 🔧 Advanced Features

### Custom API Endpoints
You can use different IP geolocation services by modifying the configuration:

```javascript
window.ipTracker = new IPTracker({
    apiEndpoint: 'https://ipapi.co/json/',
    fallbackEndpoint: 'https://api.ipify.org?format=json'
});
```

### Admin Panel
Uncomment this line in `ip-tracker.js` to enable the floating admin panel:
```javascript
window.ipTracker.createAdminPanel();
```

## 🐛 Troubleshooting

### No Data Showing
1. Check browser console for errors
2. Ensure JavaScript is enabled
3. Try refreshing the page
4. Check if local storage is enabled

### Geolocation Not Working
1. The system uses free APIs that may have rate limits
2. If geolocation fails, IP addresses are still recorded
3. Consider upgrading to paid geolocation services for higher accuracy

### Dashboard Not Loading
1. Ensure you're accessing the dashboard from the same domain as your main site
2. Check that `admin-dashboard.html` is in the same directory as your main site
3. Clear browser cache and try again

## 🔄 Updates and Maintenance

The tracking system is self-contained and requires minimal maintenance. To update:

1. **Monitor Storage Usage**: The system automatically limits stored visits to prevent excessive storage use
2. **Regular Data Export**: Export data periodically for backup
3. **API Monitoring**: Check if the geolocation APIs are still working

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all files are properly uploaded to GitHub
3. Test the dashboard on different browsers
4. Consider the privacy implications and local regulations

## 🎯 Next Steps

Consider these enhancements:
1. **Server-Side Tracking**: For more robust analytics, consider using a backend service
2. **Real-Time Dashboard**: Implement WebSocket connections for live updates
3. **Advanced Analytics**: Add bounce rate, session duration, and page views
4. **Data Visualization**: Create charts and graphs for better insights

---

**Note**: This tracking system complements your existing Google Analytics setup and provides additional insights while maintaining visitor privacy through local storage.
