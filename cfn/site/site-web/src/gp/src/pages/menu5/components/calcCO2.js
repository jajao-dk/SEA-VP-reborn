export default async function calCO2 (obj) {
  console.log('calCO2')
  const paramArr = []

  const calcTotalCO2 = function (targetObj, flag) {
    const addObj = {}
    const sfoConvFactor = 3.114
    const ulsConvFactor = 3.151
    const dogoConvFactor = 3.206
    let totalCO2 = 0.0
    const imoNumber = '9705158'
    if (typeof targetObj.cons_fo_over_0_1 === 'number') {
      totalCO2 += targetObj.cons_fo_over_0_1 * sfoConvFactor
    }
    if (typeof targetObj.cons_fo_max_0_1 === 'number') {
      totalCO2 += targetObj.cons_fo_max_0_1 * ulsConvFactor
    }
    if (typeof targetObj.cons_dogo_over_0_1 === 'number') {
      totalCO2 += targetObj.cons_dogo_over_0_1 * dogoConvFactor
    }
    if (typeof targetObj.cons_dogo_max_0_1 === 'number') {
      totalCO2 += targetObj.cons_dogo_max_0_1 * dogoConvFactor
    }
    if (flag) {
      addObj.co2 = totalCO2 + latestData.co2
      addObj.distance = targetObj.distance.entire
    } else {
      addObj.co2 = totalCO2
      addObj.distance = parseFloat(targetObj.distance)
    }
    addObj.imoNumber = imoNumber
    paramArr.push(addObj)
  }

  const latestInfo = obj.from_dep_to_latest
  await calcTotalCO2(latestInfo)
  const latestData = paramArr[0]
  const futurePlans = obj.plans
  const futureFlag = true
  for (const plan of futurePlans) {
    await calcTotalCO2(plan, futureFlag)
  }
  return paramArr
}
