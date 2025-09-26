<?php declare(strict_types=1);

namespace HeyFrame\Uni\Migration\V6_7;

use Doctrine\DBAL\Connection;
use HeyFrame\Core\Framework\Log\Package;
use HeyFrame\Core\Framework\Migration\MigrationStep;

/**
 * @internal
 */
#[Package('Uni')]
class Migration1758864658Uni extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1758864658;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('
            CREATE TABLE `uni` (
              `id` BINARY(16) NOT NULL,
              `technical_name` VARCHAR(255) NULL,
              `name` VARCHAR(255) NOT NULL,
              `author` VARCHAR(255) NOT NULL,
              `preview_media_id` BINARY(16) NULL,
              `base_config` JSON NULL,
              `config_values` JSON NULL,
              `created_at` DATETIME(3) NOT NULL,
              `updated_at` DATETIME(3) NULL,
              PRIMARY KEY (`id`),
              CONSTRAINT `uniq.uni.technical_name` UNIQUE (`technical_name`),
              CONSTRAINT `json.uni.base_config` CHECK (JSON_VALID(`base_config`)),
              CONSTRAINT `json.uni.config_values` CHECK (JSON_VALID(`config_values`))
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ');

        $connection->executeStatement('
            CREATE TABLE `uni_translation` (
              `uni_id` BINARY(16) NOT NULL,
              `language_id` BINARY(16) NOT NULL,
              `description` MEDIUMTEXT COLLATE utf8mb4_unicode_ci NULL,
              `labels` JSON NULL,
              `custom_fields` JSON NULL,
              `created_at` DATETIME(3) NOT NULL,
              `updated_at` DATETIME(3) NULL,
              PRIMARY KEY (`uni_id`, `language_id`),
              CONSTRAINT `json.uni_translation.labels` CHECK (JSON_VALID(`labels`)),
              CONSTRAINT `json.uni_translation.custom_fields` CHECK (JSON_VALID(`custom_fields`)),
              CONSTRAINT `fk.uni_translation.language_id` FOREIGN KEY (`language_id`)
                REFERENCES `language` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
              CONSTRAINT `fk.uni_translation.uni_id` FOREIGN KEY (`uni_id`)
                REFERENCES `uni` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ');
    }
}
