import requests

"""
@Param
  query {object}:
    'term': '48h','5d','7d'
    'port_code': port_code, ex 'ANC'
    'client_code': 'WNI'
    'exclude_schedule': True
  url {str}: wni vp onpre url
@Return {Array}
  [0] {str}: HTTP status code
  [1] {str}: MINE Type
  [2] {str}: Body
"""
def get_port_schedule(query, url):
    try:
        client_code = query.get('client_code')
        port_code = query.get('port_code')
        term = query.get('term')
        exclude_schedule = query.get('exclude_schedule')
        if not all((client_code, port_code, term, exclude_schedule, url)):
            return [400, 'text/plain','Bad Request']
        print(f"クエリの中身：{query}")
        # full_url = 'http://pt-vpportinfo01-vmg.wni.co.jp/PortInfo/cgi/aedyn/get_port_schedule.cgi?client_code=WNI&port_code=WUHAN&term=5d&exclude_schedule=true'
        full_url = f'{url}/PortInfo/cgi/aedyn/get_port_schedule.cgi'
        payload = {
            'exclude_schedule':exclude_schedule,
            'term':term,
            'port_code':port_code,
            'client_code':client_code
        }
        response = requests.get(full_url, params=payload, timeout=10)
        print(f"Body: {response.content}")
        return [200, 'application/json' ,response.content]
    except:
        return [500, 'text/plain', 'file type ERROR']
