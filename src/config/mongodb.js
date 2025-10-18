import { env } from '~/config/environment'
import { MongoClient, ServerApiVersion } from 'mongodb'
let lacuDatabaseInstance = null
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})
export const CONNECT_DB = async () => {
    await mongoClientInstance.connect()
    lacuDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)

}
export const GET_DB = () => {
    if (!lacuDatabaseInstance) throw new Error('Hãy kết nối đến cơ sở dữ liệu')
    return lacuDatabaseInstance
}

export const CLOSE_DB = async () => {
    await mongoClientInstance.close()
}