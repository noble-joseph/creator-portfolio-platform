import express from 'express';
import authRoutes from "./authRoutes.js";
import messageRoutes from "./messageRoutes.js";

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);

router.get('/', (req, res) => {
  res.send('API is working!');
});

export default router;
