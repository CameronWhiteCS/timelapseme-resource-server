const crypto = require('crypto');
const fs = require('fs');
const { parseJwk } = require('jose/jwk/parse');

const loadKeyFile = (filePath) => {

    return fs.readFileSync(filePath, async (err) => {
        if (err) {
            console.log('An error occurred while attempting to load TimeLapseMe\'s JWT public key. The process will now terminate.');
            console.error(err);
            process.exit(1);
        }
    });
}

const publicKeyTimelapseme = crypto.createPublicKey(loadKeyFile(process.env.JWT_PUBLIC_KEY_PATH));

module.exports = { publicKeyTimelapseme };