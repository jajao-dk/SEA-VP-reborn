import { auth } from './plugin'

export function createAuthGuard () {
  return async () => {
    const search = location.search
    if ((search.includes('code=') || search.includes('error=')) && search.includes('state=')) {
      try {
        await auth.handleLoginCallback()
      } catch {
        return 'login'
      } finally {
        history.replaceState({}, document.title, location.href.replace(location.origin, '').replace(location.search, ''))
      }
    } else if (!await auth.checkLogin()) {
      return 'login'
    }
  }
}
