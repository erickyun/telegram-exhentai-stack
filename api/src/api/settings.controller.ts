import express from 'express';
import settingModel from '../models/setting.model';
const router = express.Router();

router.get('/', async (req, res) => {
  const settings = await settingModel.find();
  if (settings.length === 0) {
    res.status(404).json({
      message: 'Settings not found',
    });
    return;
  }
  res.json(settings[0]);
});

router.post('/', async (req, res) => {
  try {
    const settingsDb = await settingModel.find();
    if (settingsDb.length >= 1) {
      res.status(418).json({
        message: 'Settings already in the database',
      });
      return;
    }

    const settings = await settingModel.create(req.body);
    res.json(settings);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(422).json({
        message:
                    'Validation failed. Check validation errors for details.',
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

router.put('/:id', async (req, res) => {
  try {
    const updatedSettings = req.body;

    const settings = await settingModel.updateOne(
      { _id: req.params.id },
      updatedSettings,
    );
    res.json(settings);
  } catch (error : any) {
    if (error.name === 'ValidationError') {
      res.status(422).json({
        message:
                    'Validation failed. Check validation errors for details.',
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
export default router;
