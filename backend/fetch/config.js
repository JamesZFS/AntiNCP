module.exports = {
    IS_ABOUT_VIRUS_REG: /wuhan|pandemic|corona|virus|flu|covid|quarantine/ig, // i - ignore capitalization, g - global
    URL_REG: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&/=]*)/g,
    PROXY_HOST: '127.0.0.1',
    PROXY_PORT: 8118,
    WGET_TIMEOUT: 60000, // 1 min
    DEFAULT_HEADERS: {
        'User-Agent': 'rss-parser',
        'Accept': 'application/rss+xml',
    }
}