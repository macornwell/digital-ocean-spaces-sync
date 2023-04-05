const { watchLoop } = require('./lib')

const create = ({ services }) => {
  const syncFolder = ({ folder, cancelToken, keyPrefix='' }) => {
    const watcher = services.createWatcher({ folder, keyPrefix })
    return watchLoop({ cancelToken, watcher })
  }

  return {
    syncFolder
  }
}

module.exports = {
  create,
}
