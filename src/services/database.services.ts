import { MongoClient, Db, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schema/users.schemas'
import RefreshToken from '~/models/schema/refreshToken.schemas'
import Field from '~/models/schema/fields.schemas'
import Booking from '~/models/schema/bookings.schemas'
import Review from '~/models/schema/reviews.schemas'
import Voucher from '~/models/schema/vouchers.schemas'
import Matchmaking from '~/models/schema/matchmaking.schemas'
import RescheduleRequest from '~/models/schema/rescheduleRequests.schemas'
config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ry9qbm9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseServices {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME || 'football_booking')
  }

  async connect() {
    try {
      await this.client.connect()
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error connecting to Database: ', error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get fields(): Collection<Field> {
    return this.db.collection(process.env.DB_FIELDS_COLLECTION as string)
  }

  get bookings(): Collection<Booking> {
    return this.db.collection(process.env.DB_BOOKINGS_COLLECTION as string)
  }
  get reviews(): Collection<Review> {
    return this.db.collection(process.env.DB_REVIEWS_COLLECTION as string)
  }
  get vouchers(): Collection<Voucher> {
    return this.db.collection(process.env.DB_VOUCHERS_COLLECTION || 'vouchers')
  }
  get matchmakings(): Collection<Matchmaking> {
    return this.db.collection(process.env.DB_MATCHMAKING_COLLECTION || 'matchmakings')
  }
  get rescheduleRequests(): Collection<RescheduleRequest> {
    return this.db.collection(process.env.DB_RESCHEDULE_REQUESTS_COLLECTION || 'reschedule_requests')
  }
}

const databaseService = new DatabaseServices()
export default databaseService
