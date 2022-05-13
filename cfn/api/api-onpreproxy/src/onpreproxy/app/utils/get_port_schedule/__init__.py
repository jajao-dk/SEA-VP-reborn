import json
import requests
import base64
from aws_lambda_powertools.event_handler.api_gateway import (Response)

def get_port_schedule(query, domain):
    try:
        client_code = query['client_code']
        port_code = query['port_code']
        term = query['term']
        exclude_schedule = query['exclude_schedule']
        print(f"クエリの中身：{query}")
        # url = 'http://pt-vpportinfo01-vmg.wni.co.jp/PortInfo/cgi/aedyn/get_port_schedule.cgi?client_code=WNI&port_code=WUHAN&term=5d&exclude_schedule=true'
        url = f'{domain}/PortInfo/cgi/aedyn/get_port_schedule.cgi'
        payload = {
            'exclude_schedule':exclude_schedule,
            'term':term,
            'port_code':port_code,
            'client_code':client_code
        }
        response = requests.get(url, params=payload)
        print(f"Body: {response.content}")
        return Response(200, 'application/json' ,response.content , {'charset':'UTF-8'})
    except:
        return Response(500, 'text/plain', 'file type ERROR')
