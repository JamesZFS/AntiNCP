SET @@GLOBAL.sql_mode =
        'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET SQL_SAFE_UPDATES = 0;
CREATE SCHEMA IF NOT EXISTS `AntiNCP` DEFAULT CHARACTER SET utf8;
USE `AntiNCP`;
-- Epidemic data table
CREATE TABLE IF NOT EXISTS `Epidemic`
(
    `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date`           DATE         NOT NULL,
    `country`        CHAR(32)     NOT NULL,
    `province`       CHAR(64)     NULL,
    `city`           CHAR(64)     NULL,
    `activeCount`    INT GENERATED ALWAYS AS (GREATEST(0, confirmedCount - curedCount - deadCount)),
    `confirmedCount` INT          NOT NULL,
    `curedCount`     INT          NOT NULL,
    `deadCount`      INT          NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `index` (`date` ASC, `country` ASC, `province` ASC, `city` ASC)
)
    COMMENT = 'Epidemic data across the world.';
-- Available places table, this is a cache for epidemic data
CREATE TABLE IF NOT EXISTS `Places`
(
    `id`       INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `country`  CHAR(32)     NOT NULL,
    `province` CHAR(64)     NULL,
    `city`     CHAR(64)     NULL,
    PRIMARY KEY (`id`),
    INDEX `index` (`country` ASC, `province` ASC, `city` ASC)
)
    COMMENT = 'Available countries, provinces and cities';
-- Client ip statistics
CREATE TABLE IF NOT EXISTS `Clients`
(
    `ip`          CHAR(64) UNIQUE NOT NULL,
    `reqCount`    INT UNSIGNED    NULL DEFAULT 0,
    `prevReqTime` TIMESTAMP       NULL,
    PRIMARY KEY (`ip`),
    UNIQUE INDEX `index` (`ip` ASC)
)
    COMMENT = 'Statistical info of any visited clients';
-- News & tweets & reddit articles
CREATE TABLE IF NOT EXISTS `Articles`
(
    `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT, -- articleId
    `date`        DATETIME      NOT NULL,                -- or pubDate or isoDate or dc:date
    `title`       VARCHAR(1024) NOT NULL,
    `link`        VARCHAR(2083) NOT NULL,                -- or guid
    `creator`     VARCHAR(512)  NOT NULL,                -- or author or dc:creator
    `content`     LONGTEXT      NOT NULL,                -- or contentSnippet or description
    `sourceName`  VARCHAR(512)  NOT NULL,
    `sourceShort` VARCHAR(512)  NOT NULL,
    -- TODO add interactive `likes` attribute
    PRIMARY KEY (`id`),
    INDEX `date_idx` (`date` ASC),
    INDEX `source_idx` (`sourceShort`(8) ASC),
    INDEX `url_idx` (`link`(32) ASC)
)
    COMMENT = 'Articles related to COVID-19.';
-- Trend timeline: when - which word(id) - frequency
CREATE TABLE IF NOT EXISTS `Trends`
(
    `date` DATE        NOT NULL,
    `stem` VARCHAR(32) NOT NULL,
    `freq` DOUBLE      NOT NULL, -- frequency within a day, [0, 1]
    INDEX `idx` (`date` ASC, `stem` ASC)
)
    COMMENT = 'Trends table';
CREATE TABLE IF NOT EXISTS `TrendsSumUp`
(
    `stem`  VARCHAR(32)  NOT NULL,
    `count` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`stem`)
)
    COMMENT = 'Word frequency in all days';
CREATE TABLE IF NOT EXISTS `WordStem`
(
    `stem` VARCHAR(32) NOT NULL, -- stemmed word
    `word` VARCHAR(32) NOT NULL, -- original word before stemmed
    `freq` DOUBLE      NOT NULL, -- the bigger, the stronger mapping
    UNIQUE INDEX `idx` (`stem`, `word`)
)
    COMMENT = 'Words and their stems';
CREATE TABLE IF NOT EXISTS `Stem2Word`
(
    `stem` VARCHAR(32) NOT NULL, -- stemmed word
    `word` VARCHAR(32) NOT NULL, -- original word before stemmed
    PRIMARY KEY (`stem`)         -- one to one mapping
)
    COMMENT = 'Stem to word';
CREATE TABLE IF NOT EXISTS `WordIndex`
(
    `stem`      VARCHAR(32)  NOT NULL, -- stemmed word
    `articleId` INT UNSIGNED NOT NULL,
    `freq`      DOUBLE       NOT NULL, -- word frequency in an article, [0, 1]
    FOREIGN KEY (`articleId`) REFERENCES Articles (`id`),
    UNIQUE INDEX `idx` (`stem`, `articleId`)
)
    COMMENT = 'Word-to-article index';
CREATE TABLE IF NOT EXISTS `WordIndexSumUp`
(
    `stem`  VARCHAR(32)  NOT NULL,
    `count` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`stem`)
)
    COMMENT = 'Word frequency in all articles';
