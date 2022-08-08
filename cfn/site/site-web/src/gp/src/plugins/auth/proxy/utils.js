export async function call (fn, { prop, isLoading, error, final } = {}) {
  try {
    setProp(true, isLoading)
    const ret = await fn()

    setProp(ret, prop)
    setProp(null, error)

    return ret
  } catch (e) {
    setProp(e, error)
    if (error != null) throw e
  } finally {
    await final?.()
    setProp(false, isLoading)
  }

  return null
}

function setProp (value, prop) {
  if (prop != null) prop.value = value
}
