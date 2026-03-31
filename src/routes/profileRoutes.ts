import { Router } from 'express';
import profileController from '../api/v1/profile/profile.controller';
import { authenticate } from '../middleware/authenticate';

const profileRoutes: Router = Router().patch(
  '/change-password',
  authenticate,
  profileController.changePassword,
);

export default profileRoutes;
