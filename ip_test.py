import requests

def get_location_ipapi(ip_address):
    try:
        response = requests.get(f'http://ip-api.com/json/{ip_address}')
        data = response.json()
        
        if data['status'] == 'success':
            return {
                'ip': ip_address,
                'latitude': data['lat'],
                'longitude': data['lon'],
                'city': data['city'],
                'country': data['country'],
                'region': data['regionName'],
                'timezone': data['timezone']
            }
        else:
            return {'error': data.get('message', 'Unknown error')}
    except Exception as e:
        return {'error': str(e)}
    
print(get_location_ipapi('206.55.175.131'))


from ip_geolocation import IPGeolocation

geo = IPGeolocation()
location = geo.get_location_with_fallback('206.55.175.131')
print(location)