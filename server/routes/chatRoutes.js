import express from 'express';
import { createChat, getChats, deleteChats } from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';

const chatRouter = express.Router();


chatRouter.use(protect);

chatRouter.post('/new', createChat);
chatRouter.get('/', getChats); 
chatRouter.post('/delete', deleteChats);


export default chatRouter;