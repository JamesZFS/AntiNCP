const FLAKS_HOST = 'http://localhost:5000';

module.exports = {
    IS_ABOUT_VIRUS_REG: /wuhan|pandemic|corona|virus|flu|covid|quarantine/ig, // i - ignore capitalization, g - global
    URL_REG: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&/=]*)/g,
    DEFAULT_HEADERS: {
        'User-Agent': 'rss-parser',
        'Accept': 'application/rss+xml',
    },
    FLAKS_HOST,
    TOPIC_TAG_API: `${FLAKS_HOST}/tag/:start_id/:end_id/`,
    TOPIC_PING_API: `${FLAKS_HOST}/ping`,
    TOPIC_NAME_API: `${FLAKS_HOST}/topic_names`,
};