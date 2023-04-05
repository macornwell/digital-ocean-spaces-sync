const { ArgumentParser } = require('argparse')
const { loadDependencies } = require('../src/apps')
const { create: createFlows } = require('../src/flows')
const { createNeverCancelToken } = require('../src/lib')
const SUCCESS = 0


const _parseArguments = () => {
  const parser = new ArgumentParser({
    description: 'Watches a folder and uploads/removes changes to Digital Ocean Spaces.'
  })
  parser.add_argument('environment', { help: 'The environment to run the application in. Affects which configuration file is loaded.'})
  parser.add_argument('folder', { help: 'The path to the folder that should be synced.' })
  parser.add_argument('-k', '--keyPrefix', { help: 'A key prefix to add to the front of the uploaded file.', default: '' })
  return parser.parse_args()
}


const main = async () => {
  const args = _parseArguments()
  const dependencies = await loadDependencies({ environment: args.environment })
  const flows = await createFlows(dependencies)
  const cancelToken = createNeverCancelToken()
  await flows.syncFolder({ folder: args.folder, cancelToken, keyPrefix: args.keyPrefix})
  return SUCCESS
}


if (require.main === module) {
  return main()
}


return -1
