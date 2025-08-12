#!/usr/bin/env python3
"""
Simple examples of using the IP geolocation services
"""

import requests
from ip_geolocation import IPGeolocation

def example_basic_usage():
    """Basic usage example"""
    print("🌍 Basic IP Geolocation Example")
    print("=" * 40)
    
    geo = IPGeolocation()
    
    # Single IP lookup
    ip = "8.8.8.8"
    result = geo.get_location(ip, provider='ip-api')
    
    if 'error' not in result:
        print(f"IP: {result['ip']}")
        print(f"Location: {result['latitude']}, {result['longitude']}")
        print(f"City: {result['city']}")
        print(f"Country: {result['country']}")
    else:
        print(f"Error: {result['error']}")

def example_with_fallback():
    """Example using multiple providers with fallback"""
    print("\n🔄 Fallback Provider Example")
    print("=" * 40)
    
    geo = IPGeolocation()
    
    test_ips = ["1.1.1.1", "208.67.222.222", "8.8.8.8"]
    
    for ip in test_ips:
        print(f"\n📍 Looking up: {ip}")
        result = geo.get_location_with_fallback(ip)
        
        if 'error' not in result:
            print(f"  ✅ Provider: {result.get('provider_used')}")
            print(f"  📍 Coordinates: {result['latitude']}, {result['longitude']}")
            print(f"  🏙️  Location: {result['city']}, {result['country']}")
        else:
            print(f"  ❌ Failed: {result['error']}")

def example_batch_processing():
    """Example of processing multiple IPs"""
    print("\n📊 Batch Processing Example")
    print("=" * 40)
    
    geo = IPGeolocation()
    
    # List of IPs to process
    ip_list = [
        "8.8.8.8",      # Google DNS - USA
        "1.1.1.1",      # Cloudflare - USA  
        "208.67.222.222", # OpenDNS - USA
        "77.88.8.8",    # Yandex DNS - Russia
        "180.76.76.76"  # Baidu DNS - China
    ]
    
    results = []
    
    for ip in ip_list:
        print(f"Processing {ip}...")
        result = geo.get_location_with_fallback(ip)
        results.append(result)
    
    # Display results
    print("\n📋 Results Summary:")
    for result in results:
        if 'error' not in result:
            print(f"  {result['ip']:15} → {result['city']:15} {result['country']:20} ({result['latitude']:.2f}, {result['longitude']:.2f})")
        else:
            print(f"  {result.get('ip', 'Unknown'):15} → Error: {result['error']}")

def example_web_service_client():
    """Example of using the Flask web service"""
    print("\n🌐 Web Service Client Example")
    print("=" * 40)
    
    # Assuming the Flask service is running on localhost:5000
    base_url = "http://localhost:5000"
    
    try:
        # Test the service
        response = requests.get(f"{base_url}/geolocate?ip=8.8.8.8")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Web service working!")
                print(f"IP: {data['ip']}")
                print(f"Location: {data['latitude']}, {data['longitude']}")
                print(f"City: {data['city']}, {data['country']}")
            else:
                print(f"❌ Service error: {data.get('error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("⚠️  Web service not running. Start it with:")
        print("   python geolocation_service.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def example_integration_with_website():
    """Example of how to integrate with your website's IP tracker"""
    print("\n🔗 Website Integration Example")
    print("=" * 40)
    
    # This shows how you could enhance your existing IP tracker
    # with more accurate geolocation data
    
    geo = IPGeolocation()
    
    # Simulate visitor IPs (these would come from your website)
    visitor_ips = ["203.0.113.1", "198.51.100.1", "192.0.2.1"]
    
    enhanced_visitor_data = []
    
    for ip in visitor_ips:
        # Get enhanced location data
        location = geo.get_location_with_fallback(ip)
        
        if 'error' not in location:
            visitor_record = {
                'ip': ip,
                'timestamp': '2024-01-01T12:00:00Z',  # Would be actual timestamp
                'latitude': location['latitude'],
                'longitude': location['longitude'],
                'city': location['city'],
                'country': location['country'],
                'region': location['region'],
                'timezone': location['timezone'],
                'accuracy': 'high',  # Since we're using multiple providers
                'provider': location.get('provider_used', 'unknown')
            }
        else:
            # Fallback to basic data
            visitor_record = {
                'ip': ip,
                'timestamp': '2024-01-01T12:00:00Z',
                'latitude': None,
                'longitude': None,
                'city': 'Unknown',
                'country': 'Unknown',
                'accuracy': 'low',
                'error': location['error']
            }
        
        enhanced_visitor_data.append(visitor_record)
    
    # Display enhanced data
    print("Enhanced visitor data:")
    for record in enhanced_visitor_data:
        if record['latitude']:
            print(f"  {record['ip']} → {record['city']}, {record['country']} ({record['latitude']:.2f}, {record['longitude']:.2f})")
        else:
            print(f"  {record['ip']} → Location unknown")

if __name__ == "__main__":
    # Run all examples
    example_basic_usage()
    example_with_fallback()
    example_batch_processing()
    example_web_service_client()
    example_integration_with_website()
    
    print("\n🎉 All examples completed!")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Run the web service: python geolocation_service.py")
    print("3. Test with your own IPs")
    print("4. Integrate with your website's IP tracker")
