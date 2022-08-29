export default async function getYTDData (params) {
  console.log('getYTDData')
  console.log(params)

  const requestUrl = 'https://cii.seapln-osr.pt-aws.wni.com/v1/vdv/ytd/'

  const requestBody = params
  const perfJson = await fetch(requestUrl, {
    method: 'POST',
    url: requestUrl,
    body: JSON.stringify(requestBody)
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
  console.log(perfJson)
  return perfJson
}
