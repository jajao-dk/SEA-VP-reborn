export const dayjsFloorCeil = (option, dayjsClass, dayjsFactory) => {
  dayjsClass.prototype.ceil = function (amount, unit) {
    return this.add(amount - (this.get(unit) % amount), unit).startOf(unit)
  }
  dayjsClass.prototype.floor = function (amount, unit) {
    return this.subtract((this.get(unit) % amount), unit).startOf(unit)
  }
}
