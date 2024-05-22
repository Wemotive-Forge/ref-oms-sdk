import passportLocal from 'passport-local';
import {Sequelize, User} from '../../../models';

const Op = Sequelize.Op;
const LocalStrategy = passportLocal.Strategy;

const passportUsernameLocalStrategy = new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({
            where: {
                username: {
                    [Op.iLike]: username
                }
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
        return done(null, false);
    }
});

export default passportUsernameLocalStrategy;
