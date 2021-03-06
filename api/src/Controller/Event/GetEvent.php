<?php declare(strict_types=1);
/*.
    require_module 'standard';
.*/

/**
 *  @OA\Get(
 *      tags={"events"},
 *      path="/event/{id}",
 *      summary="Gets an event",
 *      @OA\Parameter(
 *          description="Id of the event",
 *          in="path",
 *          name="id",
 *          required=true,
 *          @OA\Schema(type="integer")
 *      ),
 *      @OA\Parameter(
 *          ref="#/components/parameters/short_response",
 *      ),
 *      @OA\Response(
 *          response=200,
 *          description="Event found",
 *          @OA\JsonContent(
 *           ref="#/components/schemas/event"
 *          ),
 *      ),
 *      @OA\Response(
 *          response=401,
 *          ref="#/components/responses/401"
 *      ),
 *      @OA\Response(
 *          response=404,
 *          ref="#/components/responses/event_not_found"
 *      ),
 *      security={{"ciab_auth":{}}}
 *  )
 **/

namespace App\Controller\Event;

use Slim\Http\Request;
use Slim\Http\Response;
use Atlas\Query\Select;

use App\Controller\NotFoundException;

class GetEvent extends BaseEvent
{


    public function buildResource(Request $request, Response $response, $params): array
    {
        $select = Select::new($this->container->db);
        $select->columns(...BaseEvent::selectMapping());
        $select->from('Events');
        if ($params['id'] == 'current') {
            $select->where('`DateTo` >= NOW()');
            $select->orderBy('DateFrom ASC LIMIT 1');
        } else {
            $select->whereEquals(['EventID' => $params['id']]);
        }
        $data = $select->fetchOne();
        if (empty($data)) {
            throw new NotFoundException("Event '{$params['id']}' Not Found");
        }
        $this->id = $data['id'];

        return [
        \App\Controller\BaseController::RESOURCE_TYPE,
        $data
        ];

    }


    /* end GetEvent */
}
