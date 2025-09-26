<?php declare(strict_types=1);

namespace HeyFrame\Uni\DependencyInjection;

use HeyFrame\Core\Framework\DependencyInjection\CompilerPass\AbstractMigrationReplacementCompilerPass;
use HeyFrame\Core\Framework\Log\Package;

#[Package('framework')]
class UniMigrationReplacementCompilerPass extends AbstractMigrationReplacementCompilerPass
{
    protected function getMigrationPath(): string
    {
        return \dirname(__DIR__);
    }

    protected function getMigrationNamespacePart(): string
    {
        return 'Uni';
    }
}
