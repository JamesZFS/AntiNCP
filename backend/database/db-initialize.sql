DROP SCHEMA IF EXISTS `AntiNCP`;
CREATE SCHEMA IF NOT EXISTS `AntiNCP` DEFAULT CHARACTER SET utf8 ;
USE `AntiNCP`;
# epidemic data table
CREATE TABLE IF NOT EXISTS `Epidemic` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `time` DATETIME NOT NULL COMMENT 'Update date-time',
  `date` DATE GENERATED ALWAYS AS (DATE_FORMAT(time,'%Y-%m-%d')),
  `country` CHAR(32) NOT NULL,
  `province` CHAR(32) NULL,
  `city` CHAR(32) NULL,
  `confirmedCount` INT NULL DEFAULT -1,
  `suspectedCount` INT NULL DEFAULT -1,
  `curedCount` INT NULL DEFAULT -1,
  `deadCount` INT NULL DEFAULT -1,
  PRIMARY KEY (`id`, `time`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `date_idx` (`date` ASC),
  INDEX `province_idx` (`province` ASC))
COMMENT = 'Epidemic data across the world.';
# other tables...
