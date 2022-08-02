export default async function calCO2 (obj, imoNumber) {
  const paramArr = []
  console.log('calCO2')

  const hsfoCons = obj.hsfo
  const dogoCons = obj.lsdogo

  const addObj = {}
  const sfoConvFactor = 3.114
  const ulsConvFactor = 3.151
  const dogoConvFactor = 3.206
  let totalCO2 = 0.0

  // FOCは油種区別ができない為悪い値をとる3.151を使用
  totalCO2 += hsfoCons * ulsConvFactor
  totalCO2 += dogoCons * dogoConvFactor

  addObj.co2 = totalCO2
  addObj.distance = obj.distance
  addObj.imoNumber = imoNumber

  paramArr.push(addObj)
  return paramArr
}
