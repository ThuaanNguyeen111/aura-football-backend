"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ry9qbm9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
class DatabaseServices {
    client;
    db;
    constructor() {
        this.client = new mongodb_1.MongoClient(uri);
        this.db = this.client.db(process.env.DB_NAME || 'football_booking');
    }
    async connect() {
        try {
            await this.client.connect();
            await this.db.command({ ping: 1 });
            console.log('Pinged your deployment. You successfully connected to MongoDB!');
        }
        catch (error) {
            console.log('Error connecting to Database: ', error);
            throw error;
        }
    }
    get users() {
        return this.db.collection(process.env.DB_USERS_COLLECTION);
    }
    get refreshTokens() {
        return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION);
    }
    get fields() {
        return this.db.collection(process.env.DB_FIELDS_COLLECTION);
    }
    get bookings() {
        return this.db.collection(process.env.DB_BOOKINGS_COLLECTION);
    }
    get reviews() {
        return this.db.collection(process.env.DB_REVIEWS_COLLECTION);
    }
}
const databaseService = new DatabaseServices();
exports.default = databaseService;
