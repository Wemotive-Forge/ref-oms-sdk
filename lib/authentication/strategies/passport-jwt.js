import passportJWT from 'passport-jwt';
import {Role, User,Organization} from '../../../models';
import {UnauthenticatedError} from '../../errors';
import MESSAGES from '../../../utils/messages';

const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const jwtExtractor = function (req,res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // if (req && req.cookies) {
    //   token = req.cookies['jwt'];
    // }
    return token;
};

const opts = {
    jwtFromRequest: jwtExtractor,
    secretOrKey: process.env.JWT_TOKEN_SECRET,
};

const passportJwtStrategy = new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
        let user = await User.findOne({
            where: {
                id: jwtPayload.user.id
            },
            include: [{model:Role},{model:Organization}],
        });

        if (!user) {
            return done(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID), null);
        } else if (user.enabled === false) {
            return done(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCOUNT_DEACTIVATED), null);
        }
        // find and attach user roles
        const roles = await user.getRoles({attributes: ['name']});
        user = user.toJSON();

        //user.Organizations=orgUsers;
        if(user.Organizations.length>0){
            user.OrganizationId=user.Organizations[0].id;
        }

        // console.log("user--->",user)

        user.roles = roles;
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
});

export default passportJwtStrategy;
