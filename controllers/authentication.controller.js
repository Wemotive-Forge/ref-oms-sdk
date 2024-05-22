import {authenticationService} from '../services/oms';

class AuthenticationController {
    loginWithOTP(req, res, next) {
        const data = req.body
        authenticationService.loginWithOTP(data).then(() => {
            res.status(200).send();
        }).catch((err) => {
            next(err);
        });
    }

    verifyOTP(req, res, next) {
        const data = req.body
        authenticationService.verifyOTP(data).then((data) => {
            res.json({data});
            // res.cookie('jwt', data.token, cookieOptions)
            //   .json({ data });
        }).catch((err) => {
            next(err);
        });
    }

    dumpData(req, res, next) {
        const data = req.body
        authenticationService.dumpData(data).then((data) => {
            res.json({data});
            // res.cookie('jwt', data.token, cookieOptions)
            //   .json({ data });
        }).catch((err) => {
            next(err);
        });
    }
}

module.exports = new AuthenticationController();
