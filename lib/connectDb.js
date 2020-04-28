const getenv = require('getenv')
const mongodb = require('mongodb')

module.exports = (callback) => {
  const dbName = 'user-accounts-express'
  const dbPassword = getenv('MONGO_GENERAL_ADMIN_PASSWORD')
  const dbUsername = getenv('MONGO_GENERAL_ADMIN_USERNAME')
  const dbHostname = getenv('MONGO_GENERAL_HOSTNAME')
  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
  const uri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbHostname}/${dbName}?retryWrites=true&w=majority`
  const mongoClient = new mongodb.MongoClient(uri, dbOptions)
  mongoClient.connect((error) => {
    if (error) {
      return callback(error)
    }
    const db = mongoClient.db(dbName)
    return callback(null, db)
  })
}
