<?php declare(strict_types=1);
/*.
    require_module 'standard';
.*/

/**
 *  @OA\Get(
 *      tags={"departments"},
 *      path="/department",
 *      summary="Lists departments",
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
 *          description="OK",
 *          @OA\JsonContent(
 *              ref="#/components/schemas/department_list"
 *          )
 *      ),
 *      @OA\Response(
 *          response=401,
 *          ref="#/components/responses/401"
 *      ),
 *      security={{"ciab_auth":{}}}
 *  )
 **/

namespace App\Controller\Department;

use Slim\Http\Request;
use Slim\Http\Response;

class ListDepartments extends BaseDepartment
{


    public function buildResource(Request $request, Response $response, $params): array
    {
        $output = $this->getDepartment(null);
        return [
        \App\Controller\BaseController::LIST_TYPE,
        $output,
        array('type' => 'department_list')];

    }


    /* end ListDepartments */
}
