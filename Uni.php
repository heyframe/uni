<?php declare(strict_types=1);

namespace HeyFrame\Uni;

use HeyFrame\Core\Framework\Bundle;
use HeyFrame\Core\Framework\Log\Package;
use HeyFrame\Uni\DependencyInjection\UniMigrationReplacementCompilerPass;
use HeyFrame\Uni\Framework\UniInterface;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\XmlFileLoader;

/**
 * @internal
 */
#[Package('framework')]
class Uni extends Bundle implements UniInterface
{
    /**
     * {@inheritdoc}
     */
    public function build(ContainerBuilder $container): void
    {
        parent::build($container);
        $this->buildDefaultConfig($container);

        $loader = new XmlFileLoader($container, new FileLocator(__DIR__ . '/DependencyInjection'));
        $loader->load('services.xml');
        $container->addCompilerPass(new UniMigrationReplacementCompilerPass());
    }
}
