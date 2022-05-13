import json
import requests
import base64
from aws_lambda_powertools.event_handler.api_gateway import (Response)

def get_gpf_content(query, domain):
    try:
        client_code = query['client_code']
        port_code = query['port_code']
        term = query['term']
        file_type = query['type']
        # url = 'http://pt-vpportinfo01-vmg.wni.co.jp/PortInfo/cgi/get_gpf_content.cgi?type=pdf&term=5d&port_code=ANC&client_code=WNI'
        url = f'{domain}/PortInfo/cgi/get_gpf_content.cgi'
        payload = {
            'type':file_type,
            'term':term,
            'port_code':port_code,
            'client_code':client_code
        }
        response = requests.get(url, params=payload)
        print(f"Body: {response.content}")
        # file_typeにより返し方を変える。
        if (file_type == "pdf"):
            print('pdfで返す')  
            return Response(200, 'application/pdf',response.content)
        elif (file_type == "txt"):
            print('txtで返す')
            return Response(200, 'text/plain',response.content , {'charset':'UTF-8'})
        return {
            'headers': { "Content-Type": "text/plain; charset=UTF-8" },
            'statusCode': 500,
            'body': 'file type ERROR'
        }
    except:
        return {
              'headers': { "Content-Type": "text/plain; charset=UTF-8" },
              'statusCode': 500,
              'body': 'file type ERROR'
          }