<?php declare(strict_types=1);
/*.
    require_module 'standard';
.*/

/**
 *  @OA\Post(
 *      tags={"artshow"},
 *      path="/artshow/print",
 *      summary="Adds a new piece of print art",
 *      @OA\RequestBody(
 *          @OA\MediaType(
 *              mediaType="multipart/form-data",
 *              @OA\Schema(
 *                  @OA\Property(
 *                      ref="#/components/schemas/artshow_print"
 *                  )
 *              )
 *          )
 *      ),
 *      @OA\Response(
 *          response=201,
 *          description="Print added",
 *          @OA\JsonContent(
 *           ref="#/components/schemas/artshow_print"
 *          ),
 *      ),
 *      @OA\Response(
 *          response=401,
 *          ref="#/components/responses/401"
 *      ),
 *      security={{"ciab_auth":{}}}
 *  )
 **/

namespace App\Modules\artshow\Controller\PrintArt;

use Slim\Http\Request;
use Slim\Http\Response;
use Atlas\Query\Select;
use Atlas\Query\Insert;
use App\Controller\InvalidParameterException;

class PostPrint extends BasePrint
{


    public function buildResource(Request $request, Response $response, $params): array
    {
        $body = $this->checkRequiredBody($request, ['name', 'art_type', 'quantity', 'price']);

        if (!array_key_exists('event', $body)) {
            $body['event'] = $this->currentEvent();
        }
        if (array_key_exists('artist', $params)) {
            $body['artist'] = $params['artist'];
        }

        $this->checkPermission($request, 'add', $body['artist']);
        $fields = BasePrint::insertPayloadFromParams($body, false);

        $data = Select::new($this->container->db)
            ->columns('MAX(PieceID) AS id')
            ->from('Artshow_PrintShopArt')
            ->where('EventID = ', $fields['EventID'])
            ->fetchOne();
        if (empty($data) || $data['id'] == null) {
            $fields['PieceID'] = 1;
        } else {
            $fields['PieceID'] = intval($data['id']) + 1;
        }

        $data = Select::new($this->container->db)
            ->columns('PieceType')
            ->from('Artshow_PieceType')
            ->whereEquals(['PieceType' => $body['art_type']])
            ->fetchOne();

        if (empty($data)) {
            throw new InvalidParameterException('\'art_type\' parameter not valid \''.$body['art_type'].'\'');
        }

        Insert::new($this->container->db)
            ->into('Artshow_PrintShopArt')
            ->columns($fields)
            ->perform();

        $target = new GetPrint($this->container);
        $newparams = ['piece' => $fields['PieceID'], 'event' => $fields['EventID']];
        $data = $target->buildResource($request, $response, $newparams)[1];

        return [
        \App\Controller\BaseController::RESOURCE_TYPE,
        $target->arrayResponse($request, $response, $data[0]),
        201
        ];

    }


    /* end PostPrint */
}
