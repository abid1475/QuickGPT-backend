import express, { Router } from 'express';
import { getPlans, purchasePlan } from '../controllers/creditController.js';
import { protect } from '../middlewares/auth.js';

const creditRoute = express.Router();

creditRoute.get('/plan', getPlans);
creditRoute.post('/purchase', protect, purchasePlan);


export default creditRoute;