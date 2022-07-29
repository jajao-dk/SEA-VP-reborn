export default async function calcCII (arrObj) {
  console.log('calcCII')
  const d = new Date()
  const year = d.getUTCFullYear()
  console.log(arrObj)
  const url = 'https://7hxb43ua0j.execute-api.ap-northeast-1.amazonaws.com/dev/cii-calc/' + year
  const body = arrObj
  const perfJson = await fetch(url, {
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(body)
  })
  return perfJson.json()
}
