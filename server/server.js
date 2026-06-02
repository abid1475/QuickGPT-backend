
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import userRoute from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoute.js';
import creditRoute from './routes/creditsRoute.js';
import { stripeWebhooks } from './controllers/webhook.js';

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Database connection
connectDB();

//  Stripe Webhook
app.post('/api/stripe', express.raw({type:'application/json'}),stripeWebhooks)



// Port
const PORT = process.env.PORT || 3000;


// Routes
app.get('/', (req, res) => res.send("Server is live"));

app.use('/api/user', userRoute);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);
app.use('/api/credit', creditRoute);



// Server
app.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}`);
});
