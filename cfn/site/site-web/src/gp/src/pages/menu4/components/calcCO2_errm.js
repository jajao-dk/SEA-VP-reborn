export default async function calCO2 (obj, imoNumber, lastRepTime) {
  const paramArr = []
  console.log('calCO2')

  const calcTotalCO2 = function (consObj, imoNumber) {
    const addObj = {}
    const sfoConvFactor = 3.114
    const ulsConvFactor = 3.151
    const dogoConvFactor = 3.206
    let totalCO2 = 0.0
    // FOCは油種区別ができない為悪い値をとる3.151を使用
    totalCO2 += consObj.total_fo_cons * ulsConvFactor
    totalCO2 += consObj.total_godo_cons * dogoConvFactor
    addObj.co2 = totalCO2
    addObj.imoNumber = imoNumber
    paramArr.push(addObj)
  }

  const foArr = obj.total_fo
  const godoArr = obj.total_dogo

  let foCons = 0.0
  let godoCons = 0.0
  if (lastRepTime) {
    for (let i = 0; i < foArr.length; i++) {
      if (typeof foArr[i].me === 'number') {
        foCons += foArr[i].me
      }
      if (typeof foArr[i].ae === 'number') {
        foCons += foArr[i].ae
      }
      if (typeof foArr[i].other === 'number') {
        foCons += foArr[i].other
      }
      if (foArr[i].date === lastRepTime) {
        console.log(`total_fo last date: ${foArr[i].date}`)
        break
      }
    }
    for (let i = 0; i < godoArr.length; i++) {
      if (typeof godoArr[i].me === 'number') {
        godoCons += godoArr[i].me
      }
      if (typeof godoArr[i].ae === 'number') {
        godoCons += godoArr[i].ae
      }
      if (typeof godoArr[i].other === 'number') {
        godoCons += godoArr[i].other
      }
      if (foArr[i].date === lastRepTime) {
        console.log(`total_dogo last date: ${foArr[i].date}`)
        break
      }
    }
  }
  const consObj = {
    total_fo_cons: foCons,
    total_godo_cons: godoCons
  }
  await calcTotalCO2(consObj, imoNumber)
  return paramArr
}
