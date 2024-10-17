import {Router} from 'express';
import passport from 'passport';
import {passportUsernameLocalStrategy} from '../lib/authentication';
import {authenticationController} from '../controllers';

const router = new Router();
passport.use(passportUsernameLocalStrategy);


// router.post('/login', passport.authenticate('local', { session: false }), authenticationController.login);

router.post('/login', authenticationController.verifyOTP);

router.post('/verify-otp', authenticationController.verifyOTP);
router.post('/loadData', authenticationController.dumpData);

export default router;
