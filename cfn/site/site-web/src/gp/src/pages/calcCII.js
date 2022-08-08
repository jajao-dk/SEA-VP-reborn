import values from '../scripts/values'

export default async function calcCII (arrObj) {
  console.log('calcCII')
  console.log(arrObj)
  const d = new Date()
  const year = d.getUTCFullYear()

  // 本運用リリース時はドメインを揃える
  const isB01 = location.hostname.match(/vp-b01.weathernews.com/)
  let ciiCalcUrl = ''
  if (isB01) {
    ciiCalcUrl = 'https://b01-cii.seapln-osr.prod-aws.wni.com/v1/cii-calc'
  } else {
    ciiCalcUrl = 'https://cii.seapln-osr.pt-aws.wni.com/v1/cii-calc'
  }

  const url = `${ciiCalcUrl}/${year}`
  const body = arrObj
  const perfJson = await fetch(url, {
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(body)
  })
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      return data
    })
    .catch(() => {
      return []
    })
  return perfJson
}
