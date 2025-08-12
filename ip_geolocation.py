#!/usr/bin/env python3
"""
IP Geolocation Script
Supports multiple providers for getting latitude/longitude from IP addresses
"""

import requests
import json
import time
from typing import Dict, Optional, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IPGeolocation:
    """
    IP Geolocation class supporting multiple providers
    """
    
    def __init__(self):
        self.providers = {
            'ip-api': self._get_location_ipapi,
            'ipinfo': self._get_location_ipinfo,
            'ipgeolocation': self._get_location_ipgeolocation,
            'abstractapi': self._get_location_abstractapi,
            'ipstack': self._get_location_ipstack
        }
    
    def get_location(self, ip_address: str, provider: str = 'ip-api', **kwargs) -> Dict:
        """
        Get location data for an IP address
        
        Args:
            ip_address: IP address to lookup
            provider: Provider to use ('ip-api', 'ipinfo', 'ipgeolocation', etc.)
            **kwargs: Provider-specific arguments (like API keys)
        
        Returns:
            Dictionary with location data
        """
        if provider not in self.providers:
            return {'error': f'Unknown provider: {provider}'}
        
        try:
            return self.providers[provider](ip_address, **kwargs)
        except Exception as e:
            logger.error(f"Error with provider {provider}: {e}")
            return {'error': str(e)}
    
    def get_location_with_fallback(self, ip_address: str, providers: List[str] = None) -> Dict:
        """
        Try multiple providers until one succeeds
        
        Args:
            ip_address: IP address to lookup
            providers: List of providers to try in order
        
        Returns:
            Dictionary with location data from first successful provider
        """
        if providers is None:
            providers = ['ip-api', 'ipinfo', 'ipgeolocation']
        
        for provider in providers:
            logger.info(f"Trying provider: {provider}")
            result = self.get_location(ip_address, provider)
            
            if 'error' not in result and result.get('latitude') is not None:
                result['provider_used'] = provider
                return result
            
            # Rate limiting - wait between requests
            time.sleep(0.5)
        
        return {'error': 'All providers failed'}
    
    def _get_location_ipapi(self, ip_address: str, **kwargs) -> Dict:
        """
        IP-API.com - Free, no API key required
        Rate limit: 45 requests per minute
        """
        try:
            url = f'http://ip-api.com/json/{ip_address}'
            response = requests.get(url, timeout=10)
            data = response.json()
            
            if data['status'] == 'success':
                return {
                    'ip': ip_address,
                    'latitude': data.get('lat'),
                    'longitude': data.get('lon'),
                    'city': data.get('city'),
                    'country': data.get('country'),
                    'country_code': data.get('countryCode'),
                    'region': data.get('regionName'),
                    'timezone': data.get('timezone'),
                    'isp': data.get('isp'),
                    'provider': 'ip-api'
                }
            else:
                return {'error': data.get('message', 'Unknown error')}
                
        except Exception as e:
            return {'error': f'IP-API error: {str(e)}'}
    
    def _get_location_ipinfo(self, ip_address: str, token: str = None, **kwargs) -> Dict:
        """
        IPInfo.io - Free tier: 50,000 requests/month
        """
        try:
            url = f'https://ipinfo.io/{ip_address}/json'
            headers = {}
            if token:
                headers['Authorization'] = f'Bearer {token}'
            
            response = requests.get(url, headers=headers, timeout=10)
            data = response.json()
            
            if 'loc' in data:
                lat, lon = data['loc'].split(',')
                return {
                    'ip': ip_address,
                    'latitude': float(lat),
                    'longitude': float(lon),
                    'city': data.get('city'),
                    'country': data.get('country'),
                    'region': data.get('region'),
                    'timezone': data.get('timezone'),
                    'org': data.get('org'),
                    'provider': 'ipinfo'
                }
            else:
                return {'error': 'Location data not available'}
                
        except Exception as e:
            return {'error': f'IPInfo error: {str(e)}'}
    
    def _get_location_ipgeolocation(self, ip_address: str, api_key: str = None, **kwargs) -> Dict:
        """
        IPGeolocation.io - Free tier: 1000 requests/month
        """
        try:
            url = f'https://api.ipgeolocation.io/ipgeo'
            params = {'ip': ip_address}
            if api_key:
                params['apiKey'] = api_key
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if 'latitude' in data:
                return {
                    'ip': ip_address,
                    'latitude': float(data['latitude']),
                    'longitude': float(data['longitude']),
                    'city': data.get('city'),
                    'country': data.get('country_name'),
                    'country_code': data.get('country_code2'),
                    'region': data.get('state_prov'),
                    'timezone': data.get('time_zone', {}).get('name'),
                    'isp': data.get('isp'),
                    'provider': 'ipgeolocation'
                }
            else:
                return {'error': 'Location data not available'}
                
        except Exception as e:
            return {'error': f'IPGeolocation error: {str(e)}'}
    
    def _get_location_abstractapi(self, ip_address: str, api_key: str, **kwargs) -> Dict:
        """
        AbstractAPI - Requires API key
        """
        try:
            url = f'https://ipgeolocation.abstractapi.com/v1/'
            params = {
                'api_key': api_key,
                'ip_address': ip_address
            }
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if 'latitude' in data:
                return {
                    'ip': ip_address,
                    'latitude': float(data['latitude']),
                    'longitude': float(data['longitude']),
                    'city': data.get('city'),
                    'country': data.get('country'),
                    'country_code': data.get('country_code'),
                    'region': data.get('region'),
                    'timezone': data.get('timezone', {}).get('name'),
                    'provider': 'abstractapi'
                }
            else:
                return {'error': 'Location data not available'}
                
        except Exception as e:
            return {'error': f'AbstractAPI error: {str(e)}'}
    
    def _get_location_ipstack(self, ip_address: str, api_key: str, **kwargs) -> Dict:
        """
        IPStack - Requires API key
        """
        try:
            url = f'http://api.ipstack.com/{ip_address}'
            params = {'access_key': api_key}
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if 'latitude' in data:
                return {
                    'ip': ip_address,
                    'latitude': data['latitude'],
                    'longitude': data['longitude'],
                    'city': data.get('city'),
                    'country': data.get('country_name'),
                    'country_code': data.get('country_code'),
                    'region': data.get('region_name'),
                    'timezone': data.get('time_zone', {}).get('id'),
                    'provider': 'ipstack'
                }
            else:
                return {'error': data.get('error', {}).get('info', 'Unknown error')}
                
        except Exception as e:
            return {'error': f'IPStack error: {str(e)}'}

def main():
    """
    Example usage of the IPGeolocation class
    """
    geo = IPGeolocation()
    
    # Test IPs
    test_ips = [
        '8.8.8.8',  # Google DNS
        '1.1.1.1',  # Cloudflare DNS
        '208.67.222.222',  # OpenDNS
    ]
    
    for ip in test_ips:
        print(f"\n🔍 Looking up IP: {ip}")
        print("-" * 50)
        
        # Try with fallback
        result = geo.get_location_with_fallback(ip)
        
        if 'error' not in result:
            print(f"✅ Success with provider: {result.get('provider_used', 'unknown')}")
            print(f"📍 Location: {result.get('latitude')}, {result.get('longitude')}")
            print(f"🏙️  City: {result.get('city')}")
            print(f"🌍 Country: {result.get('country')}")
            print(f"🕐 Timezone: {result.get('timezone')}")
        else:
            print(f"❌ Error: {result['error']}")

if __name__ == "__main__":
    main()
