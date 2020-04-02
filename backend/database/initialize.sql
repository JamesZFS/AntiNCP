SET @@GLOBAL.sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET SQL_SAFE_UPDATES=0;
CREATE SCHEMA IF NOT EXISTS `AntiNCP` DEFAULT CHARACTER SET utf8 ;
USE `AntiNCP`;
-- epidemic data table
CREATE TABLE IF NOT EXISTS `Epidemic` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `country` CHAR(32) NOT NULL,
  `province` CHAR(32) NULL,
  `city` CHAR(32) NULL,
  `confirmedCount` INT NULL DEFAULT -1,
  `suspectedCount` INT NULL DEFAULT -1,
  `curedCount` INT NULL DEFAULT -1,
  `deadCount` INT NULL DEFAULT -1,
  PRIMARY KEY (`id`),
  INDEX `date_idx` (`date` ASC),
  INDEX `timeline_query_index` (`country` ASC, `province` ASC, `city` ASC))
COMMENT = 'Epidemic data across the world.';
-- available places table, this is a cache for epidemic data
CREATE TABLE IF NOT EXISTS `Places` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `country` CHAR(32) NOT NULL,
  `province` CHAR(32) NULL,
  `city` CHAR(32) NULL,
  PRIMARY KEY (`id`),
  INDEX `index` (`country` ASC, `province` ASC, `city` ASC))
COMMENT = 'Available countries, provinces and cities';
-- client ip statistics
CREATE TABLE IF NOT EXISTS `Clients` (
  `ip` CHAR(64) UNIQUE NOT NULL,
  `reqCount` INT UNSIGNED NULL DEFAULT 0,
  `prevReqTime` TIMESTAMP NULL,
  PRIMARY KEY (`ip`),
  UNIQUE INDEX `index` (`ip` ASC))
COMMENT = 'Statistical info of any visited clients';
-- news & tweets & reddit articles
CREATE TABLE IF NOT EXISTS `Articles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `hash` CHAR(32) GENERATED ALWAYS AS (MD5(`link`)) STORED UNIQUE,
  `date` DATETIME NOT NULL, -- or pubDate or isoDate or dc:date
  `title` VARCHAR(1024) NOT NULL,
  `link` VARCHAR(2083) NOT NULL, -- or guid
  `creator` VARCHAR(512) NOT NULL, -- or author or dc:creator
  `content` VARCHAR(4096) NOT NULL, -- or contentSnippet
  `sourceName` VARCHAR(512) NOT NULL,
  `sourceShort` VARCHAR(512) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `date_idx` (`date` ASC),
  INDEX `source_idx` (`sourceShort`(8) ASC))
COMMENT = 'Articles related to COVID-19.';