const { jwtVerify } = require('jose/jwt/verify');
const { publicKeyTimelapseme } = require('src/keys');

const UNAUTHORIZED_ERROR = 'You are not authorized to access this resource.';
const MALFORMED_ERROR = 'Malformatted access token in authorization header.';

const requireAuthentication = async (req, res, next) => {

    let authorizationHeader = req.header('Authorization');

    if (!authorizationHeader) return res.status(400).send('Access token not provided.');

    const splits = authorizationHeader.split(' ');

    if (splits.length != 2 || splits[0] != 'Bearer') return res.status(401).send(MALFORMED_ERROR);

    const accessToken = splits[1];

    try {

        const { payload, protectedHeader } = await jwtVerify(accessToken, publicKeyTimelapseme, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        });

        if(!payload.userId) {
            return res.status(401).send(UNAUTHORIZED_ERROR);
        }
            
        req.userId = payload.userId;
        return next();

    } catch (err) {
        console.error(err);
        return res.status(401).send(UNAUTHORIZED_ERROR);
    }

}

module.exports = requireAuthentication;