import Cookie from 'js-cookie'

export function createCache () {
  return {
    get (key) {
      return key in localStorage ? JSON.parse(localStorage.getItem(key)) : null
    },
    set (key, value) {
      localStorage.setItem(key, JSON.stringify(value))
    },
    remove (key) {
      if (key.startsWith('localstorage:')) {
        localStorage.removeItem(key.replace('localstorage:', ''))
      } else if (key.startsWith('cookie:')) {
        Cookie.remove(key.replace('cookie:', ''))
      }
    },
    allKeys () {
      return [
        ...Object.keys(localStorage).map(el => `localstorage:${el}`),
        ...Object.keys(Cookie.get()).map(el => `cookie:${el}`)
      ]
    }
  }
}
