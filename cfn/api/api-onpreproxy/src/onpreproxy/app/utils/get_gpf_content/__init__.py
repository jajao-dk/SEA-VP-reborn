import requests

"""
@Param
  query {object}:
    'type': 'txt', 'pdf'
    'term': '48h','5d','7d'
    'port_code': port_code, ex 'ANC'
    'client_code': 'WNI'
  url {str}: wni vp onpre url
@Return {Array}
  [0] {str}: HTTP status code
  [1] {str}: MINE Type
  [2] {str}: Body
"""
def get_gpf_content(query, url):
    try:
        client_code = query['client_code']
        port_code = query['port_code']
        term = query['term']
        file_type = query['type']
        # full_url = 'http://pt-vpportinfo01-vmg.wni.co.jp/PortInfo/cgi/get_gpf_content.cgi?type=pdf&term=5d&port_code=ANC&client_code=WNI'
        full_url = f'{url}/PortInfo/cgi/get_gpf_content.cgi'
        payload = {
            'type':file_type,
            'term':term,
            'port_code':port_code,
            'client_code':client_code
        }
        response = requests.get(full_url, params=payload)
        print(f"Body: {response.content}")
        # file_typeにより返し方を変える。
        if (file_type == "pdf"):
            print('pdfで返す')  
            return [200, 'application/pdf',response.content]
        elif (file_type == "txt"):
            print('txtで返す')
            return [200, 'text/plain',response.content]
        return [500, 'text/plain','file type ERROR']
    except:
        return [500, 'text/plain','file type ERROR']