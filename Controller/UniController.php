<?php declare(strict_types=1);

namespace HeyFrame\Uni\Controller;

use HeyFrame\Core\Framework\Log\Package;
use HeyFrame\Core\PlatformRequest;
use HeyFrame\Frontend\Framework\Routing\FrontendRouteScope;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: [PlatformRequest::ATTRIBUTE_ROUTE_SCOPE => [FrontendRouteScope::ID]])]
#[Package('framework')]
class UniController extends AbstractController
{
}
