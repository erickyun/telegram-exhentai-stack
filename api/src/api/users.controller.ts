import express from 'express';
import userModel from '../models/user.model';
const router = express.Router();

/**
 * Get all users
 */
router.get('/', async (req, res) => {
  const users = await userModel.find();
  res.json(users);
});
/**
 * Get user count
 */
router.get('/count', async (req, res) => {
  const count = await userModel.countDocuments();
  res.json({ count });
});

/**
 * Get user by _id or user_id
 */
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  let user;
  if (!id) res.send('No id provided').status(400);

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    user = await userModel.findById(req.params.id);
  } else {
    user = await userModel.findOne({ user_id: req.params.id });
  }
  res.json(user);
});

/**
 * Check if user exists returns the _id if it does
 */
router.get('/exists/:id', async (req, res) => {
  const user = await userModel.exists({ user_id: req.params.id });
  res.json(user);
});

/**
 * Create a new user
 */
router.post('/', async (req, res) => {
  try {
    const user = await userModel.create(req.body);
    res.json(user);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(422).json({
        message: 'Validation failed. Check validation errors for details.',
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        message: 'Internal Server Error',
        error: error,
      });
    }
  }
});


/**
 * Update a user
 */
router.put('/:id', async (req, res) => {
  const docId = req.params.id;
  if (!docId) res.send('No id provided').status(400);
  let user;

  try {
    const updatedUser = req.body;
    if (docId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await userModel.updateOne({ _id: req.params.id }, updatedUser);
    } else {
      user = await userModel.updateOne({ user_id: req.params.id }, updatedUser);
    }
    res.json(user);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(422).json({
        message: 'Validation failed. Check validation errors for details.',
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        message: 'Internal Server Error',
        error: error,
      });
    }
  }
});

/**
 * Delete a user
 * */
router.delete('/:id', async (req, res) => {
  const result = await userModel.deleteOne({ _id: req.params.id });
  res.status(204).json(result);
});

export default router;
