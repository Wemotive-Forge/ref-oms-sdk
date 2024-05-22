import passport from 'passport';
import {passportJwtStrategy} from '../lib/authentication';
import {UnauthenticatedError, UnauthorisedError} from '../lib/errors';
import MESSAGES from '../utils/messages';

passport.use(passportJwtStrategy);

export const middleware =
    ({ensureSameOrg} = {}) =>
        (req, res, next) => {
            // ensureSameOrg ensures either the admin is a superuser (i.e.
            // organizationId) is null or else, the value at key provided by
            // `ensureSameOrg` is same as organizationId of the user
            passport.authenticate(
                'jwt',
                {
                    session: false,
                },
                (err, user) => {
                    if (user) {
                        if (ensureSameOrg) {
                            if (
                                user.organizationId !== null ||
                                user.organizationId !== req.params.orgId
                            )
                                throw new UnauthorisedError(MESSAGES.USER_NOT_ALLOWED);
                        }
                        req.user = user;
                        const authHeader = req.headers['authorization'];
                        const token = authHeader && authHeader.split(' ')[1];

                        res.setHeader('currentUserAccessToken', token);
                        req.user.currentUserAccessToken = token;
                        console.log({token})
                        next();
                    } else if (err) {
                        next(err);
                    } else {
                        next(
                            new UnauthenticatedError(
                                MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID
                            )
                        );
                    }
                }
            )(req, res, next);
        };
