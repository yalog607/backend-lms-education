import express from 'express'
import 'dotenv/config'
import {connectDB} from './lib/db.js'
import cors from "cors"
import route from './routes/index.js'
import cookieParser from 'cookie-parser';
import rateLimiter from './middlewares/rateLimiter.js'

const app = express()
const port = process.env.PORT || 5001

app.use(
    "/api/webhook", 
    express.raw({ type: "application/json" }),
    (req, _res, next) => {
        req.rawBody = req.body
        next();
    }
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(cookieParser());
app.use(rateLimiter);

// Configure routes
route(app)

//  Connect to database and start the server
connectDB()
app.listen(port, () => {
  console.log(`App is running on port ${port}`)
})