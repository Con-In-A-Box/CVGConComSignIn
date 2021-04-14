<?php declare(strict_types=1);
/*.
    require_module 'standard';
.*/

/**
 *  @OA\Get(
 *      tags={"registration"},
 *      path="/registration/ticket/list/{member}/{event}",
 *      summary="Gets tickets for an event for a member",
 *      @OA\Parameter(
 *          description="The member",
 *          in="path",
 *          name="member",
 *          required=true,
 *          @OA\Schema(
 *              oneOf = {
 *                  @OA\Schema(
 *                      description="Member email",
 *                      type="string"
 *                  ),
 *                  @OA\Schema(
 *                      description="Member id",
 *                      type="integer"
 *                  )
 *              }
 *          )
 *      ),
 *      @OA\Parameter(
 *          description="Id of the event",
 *          in="path",
 *          name="event",
 *          required=true,
 *          @OA\Schema(type="integer")
 *      ),
 *      @OA\Parameter(
 *          description="Show voided tickets as well.",
 *          in="query",
 *          name="show_void",
 *          required=false,
 *          @OA\Schema(type="integer", enum={0,1})
 *      ),
 *      @OA\Parameter(
 *          ref="#/components/parameters/short_response",
 *      ),
 *      @OA\Parameter(
 *          ref="#/components/parameters/max_results",
 *      ),
 *      @OA\Parameter(
 *          ref="#/components/parameters/page_token",
 *      ),
 *      @OA\Response(
 *          response=200,
 *          description="Tickets found",
 *          @OA\JsonContent(
 *           ref="#/components/schemas/ticket_list"
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
 *
 *  @OA\Get(
 *      tags={"registration"},
 *      path="/registration/ticket/list/{member}",
 *      summary="Gets tickets for a member for the current event",
 *      @OA\Parameter(
 *          description="The member",
 *          in="path",
 *          name="member",
 *          required=true,
 *          @OA\Schema(
 *              oneOf = {
 *                  @OA\Schema(
 *                      description="Member email",
 *                      type="string"
 *                  ),
 *                  @OA\Schema(
 *                      description="Member id",
 *                      type="integer"
 *                  )
 *              }
 *          )
 *      ),
 *      @OA\Parameter(
 *          description="Show voided tickets as well.",
 *          in="query",
 *          name="show_void",
 *          required=false,
 *          @OA\Schema(type="integer", enum={0,1})
 *      ),
 *      @OA\Parameter(
 *          ref="#/components/parameters/max_results",
 *      ),
 *      @OA\Parameter(
 *          ref="#/components/parameters/page_token",
 *      ),
 *      @OA\Response(
 *          response=200,
 *          description="Tickets found",
 *          @OA\JsonContent(
 *           ref="#/components/schemas/ticket_list"
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
 *
 *  @OA\Get(
 *      tags={"registration"},
 *      path="/registration/ticket/list",
 *      summary="Gets tickets for the current member for the current event",
 *      @OA\Parameter(
 *          description="Show voided tickets as well.",
 *          in="query",
 *          name="show_void",
 *          required=false,
 *          @OA\Schema(type="integer", enum={0,1})
 *      ),
 *      @OA\Parameter(
 *          ref="#/components/parameters/max_results",
 *      ),
 *      @OA\Parameter(
 *          ref="#/components/parameters/page_token",
 *      ),
 *      @OA\Parameter(
 *          ref="#/components/parameters/short_response",
 *      ),
 *      @OA\Response(
 *          response=200,
 *          description="Tickets found",
 *          @OA\JsonContent(
 *           ref="#/components/schemas/ticket_list"
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

namespace App\Modules\registration\Controller\Ticket;

use Slim\Http\Request;
use Slim\Http\Response;
use Atlas\Query\Select;

use App\Controller\PermissionDeniedException;
use App\Controller\NotFoundException;

class ListTickets extends BaseTicketInclude
{


    public function buildResource(Request $request, Response $response, $params): array
    {
        $user = $request->getAttribute('oauth2-token')['user_id'];

        if (array_key_exists('member', $params)) {
            $aid = $this->getMember($request, $params['member'], 'id')[0]['id'];
        } else {
            $aid = $user;
        }

        if ($user != $aid &&
            !\ciab\RBAC::havePermission('api.registration.ticket.list')) {
            throw new PermissionDeniedException();
        }

        $select = Select::new($this->container->db)
            ->columns(...BaseTicket::selectMapping())
            ->from('Registrations')->where(' (')
            ->catWhere(' RegisteredByID = ', $aid)
            ->catWhere(' OR AccountID = ', $aid)
            ->catWhere(') ');
        if (array_key_exists('event', $params)) {
            $select->whereEquals(['EventID' => $params['event']]);
        }
        $query = $request->getQueryParams();
        if (!array_key_exists('show_void', $query) || !boolval($query['show_void'])) {
            $select->whereEquals(['VoidDate' => null]);
        }
        $tickets = $select->fetchAll();
        if (empty($tickets)) {
            throw new NotFoundException('Ticket Not Found');
        }
        if (count($tickets) > 1) {
            $output = ['type' => 'ticket_list'];
            return [
            \App\Controller\BaseController::LIST_TYPE,
            $tickets,
            $output
            ];
        } else {
            return [
            \App\Controller\BaseController::RESOURCE_TYPE,
            $tickets[0]
            ];
        }

    }


    /* end ListTickets */
}
