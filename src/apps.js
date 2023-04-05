const aws = require('aws-sdk')
const bunyan = require('bunyan')
const { create: createServices } = require('./services')
const { nullLogger } = require('./lib')

const loadDependencies = async ({environment, silent=false}) => {
  const log = silent 
    ? nullLogger()
    : bunyan.createLogger({ name: `do-sync-${environment.toLowerCase()}`})
  const services = await createServices({ environment, aws, log })

  return {
    services,
  }
}

module.exports = {
  loadDependencies,
}
