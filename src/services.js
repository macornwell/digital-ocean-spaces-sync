const get = require('lodash/get')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const Spaces = require('do-spaces').default
const { buildConfigName } = require('./lib')


const configService = async ({ environment }) => {
  const config = JSON.parse(await fs.promises.readFile(buildConfigName(environment)))

  const _getOrThrow = (key) => {
    const val = get(config, key)
    if (!val) {
      throw new Error(`Must include ${key} in config.`)
    }
    return val
  }

  const getSpacesConfig = () => {
    return _getOrThrow('spaces')
  }

  return {
    getSpacesConfig,
  }
}


const create = async ({ environment, aws, log }) => {
  const config = await configService({ environment })

  const _createWatchFuncs = ({ folder, keyPrefix='' }) => {
    folder = path.resolve(folder)
    keyPrefix = keyPrefix.slice(-1) === '/'
      ? keyPrefix.substring(0, keyPrefix.length - 1)
      : keyPrefix
    const folderLength = folder.length
    const spacesConfig = config.getSpacesConfig()
    const spaces = new Spaces(spacesConfig.connection)

    const _getSpacesPath = (filePath) => {
      const resolved = path.resolve(filePath)
      const subString = resolved.substring(folderLength)
      const relativePath = subString[0] === '/'
        ? subString.substring(1)
        : subString 
      return keyPrefix
        ? `${keyPrefix}/${relativePath}`
        : relativePath
    }

    const _upload = (filePath) => {
      const spacesPath = _getSpacesPath(filePath)
      return spaces.uploadFile({
        pathname: spacesPath,
        privacy: spacesConfig.privacy,
        file: filePath,
      })
    }

    const add = async (filePath) => {
      log.info(`${filePath} added`)
      await _upload(filePath)
        .then(() => {
          log.info(`Uploaded ${filePath} successfully`)
        })
        .catch(e => {
          log.error(`An unexpected error occurred while adding.`)
          log.error(e)
          throw e
        })
    }

    const change = async (filePath) => {
      log.info(`${filePath} changed`)
      await _upload(filePath)
        .then(() => {
          log.info(`Uploaded ${filePath} successfully`)
        })
        .catch(e => {
          log.error(`An unexpected error occurred while changing.`)
          log.error(e)
          throw e
        })
    }

    const unlink = async (filePath) => {
      log.info(`${filePath} deleted`)
      const spacesPath = _getSpacesPath(filePath)
      await spaces.deleteFile({
        pathname: spacesPath,
      })
        .then(() => {
          log.info(`Deleted ${filePath} successfully`)
        })
        .catch(e => {
          // If the file isn't there, then we didn't need to unlink.
          if (e.code === 'NoSuchKey') {
            return
          }
          log.error(`An unexpected error occurred while deleting.`)
          log.error(e)
          throw e
        })
    }

    return {
      add,
      change,
      unlink,
    }
  }


  const createWatcher = ({ folder, keyPrefix='' }) => {
    if (fs.existsSync(folder) === false) {
      throw new Error(`Folder at ${folder} does not exist.`)
    }
    const watcher = chokidar.watch(folder)
    const _watchFuncs = _createWatchFuncs({folder, keyPrefix})
    watcher.on('add', _watchFuncs.add)
    watcher.on('change', _watchFuncs.change)
    watcher.on('unlink', _watchFuncs.unlink)
    return watcher
  }

  return {
    createWatcher,
  }
}

module.exports = {
  configService,
  create,
}
