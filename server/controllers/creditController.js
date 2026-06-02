import Transaction from '../models/transaction.js';
import Stripe from 'stripe';

const plans =[
     {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]







export const getPlans = async (req, res)=>{
    try {
        res.json({success:true, plans})
        
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}


const stripe = new Stripe(process.env.STRIPE_SECERT_KEY);

// purchase plan
export const purchasePlan =async(req, res)=>{
    try {
        const {planId} = req.body;
        const userId = req.user._id;
        const plan = plans.find(plan =>plan._id === planId);
        if(!plan){
            return res.json({
                success:false,
                message:"Invalid Plan"
            })
        }

        // New transaction
        const transaction = await Transaction.create({
            userId:userId,
            planId:plan._id, 
            amount:plan.price,
            credits:plan.credits,
            isPaid:false
        })

        // const stripe = require('stripe')('sk_test_51SxKM2KXyTec4cHNTXHkUNtjSDe3vaRuJEroVfhlqoHFCH2iCuxJDTyR9OK1LeFbjNffoGMIktWb0timzZpAcC7a00d34dINWi');

        const {origin} = req.headers;
const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {                    // ← Changed to price_data
        currency: 'usd',
        unit_amount: plan.price * 100,   // e.g., 1000 for $10
        product_data: {
          name: plan.name,
          // You can also add description, images, metadata, etc.
        },
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${origin}/loading`,
  cancel_url: `${origin}`,
  metadata: { 
    transactionId: transaction._id.toString(), 
    appId: 'my-model' 
  },
  expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
});

res.json({success:true, url:session.url});
    } catch (error) {
        res.json({success:false, message:error.message});
    }
}