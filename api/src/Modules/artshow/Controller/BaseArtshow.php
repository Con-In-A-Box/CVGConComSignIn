<?php declare(strict_types=1);
/*.
    require_module 'standard';
.*/

/**
 *  @OA\Tag(
 *      name="artshow",
 *      description="Features around event art show"
 *  )
 *
 *  @OA\Parameter(
 *      parameter="target_event",
 *      description="Event being targeted",
 *      in="query",
 *      name="event",
 *      required=false,
 *      style="form",
 *      @OA\Schema(type="integer")
 *  )
 **/

namespace App\Modules\artshow\Controller;

use Slim\Container;
use Slim\Http\Request;
use App\Controller\BaseController;
use App\Controller\NotFoundException;
use App\Controller\InvalidParameterException;

abstract class BaseArtshow extends BaseController
{


    public function __construct(string $api_type, Container $container)
    {
        parent::__construct($api_type, $container);

    }


    protected function getEventId(Request $request)
    {
        $event = $request->getQueryParam('event', 'current');
        return $this->getEvent($event)['id'];

    }


    protected function checkParameter($request, $response, $source, $field)
    {
        if ($source == null || !array_key_exists($field, $source)) {
            throw new NotFoundException("Required '$field' parameter not present");
        }

    }


    protected function checkParameters($request, $response, $source, $fields)
    {
        if (is_array($fields)) {
            foreach ($fields as $field) {
                $this->checkParameter($request, $response, $source, $field);
            }
        } else {
            $this->checkParameter($source, $fields);
        }

    }


    protected function executePut($request, $response, $statement)
    {
        $result = $statement->perform();
        if ($result->rowCount() == 0) {
            throw new InvalidParameterException('Put Failed');
        }

        return [null];

    }


    /* End BaseArtshow */
}
