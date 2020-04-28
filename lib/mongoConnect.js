const getenv = require("getenv");
const mongodb = require("mongodb");

module.exports = (dbName) => {
  // MongoDB connection parameters.
  const dbPassword = getenv("MONGO_GENERAL_ADMIN_PASSWORD");
  const dbUsername = getenv("MONGO_GENERAL_ADMIN_USERNAME");
  const dbHostname = getenv("MONGO_GENERAL_HOSTNAME");
  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  const uri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbHostname}/${dbName}?retryWrites=true&w=majority`;
  return new mongodb.MongoClient(uri, dbOptions);
};
