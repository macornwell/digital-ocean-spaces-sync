
const delay = ms => new Promise(r => setTimeout(r, ms))


const watchLoop = async ({ watcher, cancelToken }) => {
  return new Promise(async (r) => {
    while(cancelToken.shouldCancel() === false) {
      await delay(1000)
    }
    watcher.close().then(r)
  })
}

const createNeverCancelToken = () => {
  const shouldCancel = () => {
    return false
  }

  return {
    shouldCancel
  }
}

const buildConfigName = (environment) => {
  return `.env.${environment.toLowerCase()}.json`
}

const nullLogger = () => {
  return {
    info: () => {},
    debug: () => {},
    warn: () => {},
    trace: () => {},
    error: () => {},
  }
}


module.exports = {
  watchLoop,
  createNeverCancelToken,
  buildConfigName,
  nullLogger,
}
