export default async function calCO2 (obj, imoNumber) {
  const paramArr = []
  console.log('calCO2')

  const calcTotalCO2 = function (consObj, imoNumber) {
    const addObj = {}
    const sfoConvFactor = 3.114
    const ulsConvFactor = 3.151
    const dogoConvFactor = 3.206
    let totalCO2 = 0.0
    // FOCは3.114を換算係数として使用する
    totalCO2 += consObj.total_fo_cons * sfoConvFactor
    totalCO2 += consObj.total_godo_cons * dogoConvFactor
    addObj.co2 = totalCO2
    addObj.imoNumber = imoNumber
    paramArr.push(addObj)
  }

  const foArr = obj.total_fo
  const godoArr = obj.total_dogo

  let foCons = 0.0
  let godoCons = 0.0
  for (let i = 0; i < foArr.length; i++) {
    if (typeof foArr[i].me === 'number') {
      foCons += foArr[i].me
    }
    if (typeof foArr[i].ae === 'number') {
      foCons += foArr[i].ae
    }
  }
  for (let i = 0; i < godoArr.length; i++) {
    if (typeof godoArr[i].me === 'number') {
      godoCons += godoArr[i].me
    }
    if (typeof godoArr[i].ae === 'number') {
      godoCons += godoArr[i].ae
    }
  }
  const consObj = {
    total_fo_cons: foCons,
    total_godo_cons: godoCons
  }
  await calcTotalCO2(consObj, imoNumber)
  return paramArr
}
