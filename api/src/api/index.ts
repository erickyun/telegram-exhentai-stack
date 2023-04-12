import express from 'express';
import { checkApiKey } from '../middlewares';
import users from './users.controller';
import doujins_exhentai from './doujins_exhentai.controller';
import settings from './settings.controller';
import logs from './logs.controller';


const router = express.Router();

router.get('/', checkApiKey, (req, res) => {
  res.json({
    message: 'Available routes',
    routes: [
      '/api/v1/users',
      '/api/v1/doujins/exhentai',
      '/api/v1/settings',
      '/api/v1/logs',
    ],

  });
});



router.use('/users', checkApiKey, users);
router.use('/doujins/exhentai', checkApiKey, doujins_exhentai);
router.use('/settings', checkApiKey, settings);
router.use('/logs', checkApiKey, logs);

export default router;
