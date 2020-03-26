/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Get port from environment and store in Express.
 */
module.exports = {
    REMOTE_HOST_DOMAIN: '129.204.207.38',
    LOCAL_HOST_PORT: normalizePort(process.env.PORT || 3000)
};
