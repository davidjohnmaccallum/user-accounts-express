const getenv = require('getenv')
const mongodb = require('mongodb')
const logger = require('./logger')(__filename)

module.exports = (callback) => {
  const dbName = getenv('MONGO_DB_NAME')
  const options = {
    w: 'majority',
    auth: { user: getenv('MONGO_USERNAME'), password: getenv('MONGO_PASSWORD') },
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
  const uri = `mongodb+srv://${getenv('MONGO_HOSTNAME')}/${dbName}?retryWrites=true`
  logger.debug('Connecting to database', uri)
  const mongoClient = new mongodb.MongoClient(uri, options)
  mongoClient.connect((error) => {
    if (error) {
      return callback(error)
    }
    logger.debug('Database connected')
    const db = mongoClient.db(dbName)
    return callback(null, db)
  })
}
