import express from 'express';
import authRoutes from "./authRoutes.js";
import messageRoutes from "./messageRoutes.js";
import creatorRoutes from "./creatorRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/creators', creatorRoutes);
router.use('/admin', adminRoutes);

router.get('/', (req, res) => {
  res.send('API is working!');
});

export default router;
