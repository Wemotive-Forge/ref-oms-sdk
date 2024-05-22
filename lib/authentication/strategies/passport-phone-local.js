import passportLocal from 'passport-local';
import {User} from '../../../models';

const LocalStrategy = passportLocal.Strategy;

const passportPhoneLocalStrategy = new LocalStrategy(async (phone, password, done) => {
    try {
        const user = await User.findOne({
            where: {
                phone
            }
        });

        if (!user) {
            return done(null, false);
        }

        const isPasswordValid = await user.authenticate(password);

        if (!isPasswordValid) {
            return done(null, false);
        }
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
});

export default passportPhoneLocalStrategy;
