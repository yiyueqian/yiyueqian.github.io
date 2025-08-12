#!/usr/bin/env python3
"""
Flask Web Service for IP Geolocation
Can be deployed to provide geolocation API for your website
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging
from typing import Dict

app = Flask(__name__)
CORS(app)  # Enable CORS for web requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeolocationService:
    """Simple geolocation service with multiple providers"""
    
    @staticmethod
    def get_location_ipapi(ip_address: str) -> Dict:
        """Get location using IP-API (free, no key required)"""
        try:
            response = requests.get(f'http://ip-api.com/json/{ip_address}', timeout=10)
            data = response.json()
            
            if data['status'] == 'success':
                return {
                    'success': True,
                    'ip': ip_address,
                    'latitude': data.get('lat'),
                    'longitude': data.get('lon'),
                    'city': data.get('city'),
                    'country': data.get('country'),
                    'region': data.get('regionName'),
                    'timezone': data.get('timezone'),
                    'provider': 'ip-api'
                }
            else:
                return {'success': False, 'error': data.get('message', 'Unknown error')}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def get_location_ipinfo(ip_address: str) -> Dict:
        """Get location using IPInfo (free tier available)"""
        try:
            response = requests.get(f'https://ipinfo.io/{ip_address}/json', timeout=10)
            data = response.json()
            
            if 'loc' in data:
                lat, lon = data['loc'].split(',')
                return {
                    'success': True,
                    'ip': ip_address,
                    'latitude': float(lat),
                    'longitude': float(lon),
                    'city': data.get('city'),
                    'country': data.get('country'),
                    'region': data.get('region'),
                    'timezone': data.get('timezone'),
                    'provider': 'ipinfo'
                }
            else:
                return {'success': False, 'error': 'Location data not available'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}

@app.route('/geolocate', methods=['GET', 'POST'])
def geolocate():
    """
    Geolocate an IP address
    
    GET: /geolocate?ip=8.8.8.8
    POST: {"ip": "8.8.8.8"}
    """
    try:
        # Get IP from request
        if request.method == 'POST':
            data = request.get_json()
            ip_address = data.get('ip') if data else None
        else:
            ip_address = request.args.get('ip')
        
        # If no IP provided, use client IP
        if not ip_address:
            ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        
        logger.info(f"Geolocating IP: {ip_address}")
        
        # Try IP-API first (free, no key required)
        result = GeolocationService.get_location_ipapi(ip_address)
        
        # If IP-API fails, try IPInfo
        if not result.get('success'):
            logger.info("IP-API failed, trying IPInfo...")
            result = GeolocationService.get_location_ipinfo(ip_address)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Geolocation error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'geolocation'})

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'service': 'IP Geolocation API',
        'endpoints': {
            '/geolocate': 'GET or POST with ip parameter',
            '/health': 'Health check'
        },
        'example': {
            'url': '/geolocate?ip=8.8.8.8',
            'response': {
                'success': True,
                'ip': '8.8.8.8',
                'latitude': 37.751,
                'longitude': -97.822,
                'city': 'Mountain View',
                'country': 'United States'
            }
        }
    })

if __name__ == '__main__':
    # For development
    app.run(debug=True, host='0.0.0.0', port=5000)

# For production deployment (e.g., with Gunicorn):
# gunicorn -w 4 -b 0.0.0.0:5000 geolocation_service:app
