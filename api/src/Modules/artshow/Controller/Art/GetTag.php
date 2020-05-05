<?php declare(strict_types=1);
/*.
    require_module 'standard';
.*/

namespace App\Modules\artshow\Controller\Art;

use Slim\Http\Request;
use Slim\Http\Response;
use App\Controller\NotFoundException;
use Atlas\Query\Select;
use Atlas\Query\Update;

class GetTag extends BaseArt
{

    use \App\Controller\TraitConfiguration;

    private $bidTag = null;


    public function buildResource(Request $request, Response $response, $params): array
    {
        $return_list = true;
        $id = $params['piece'];
        if ($id == 'demo') {
            $eid = '123';
        } else {
            $eid = $this->getEventId($request);
        }

        $data = $this->getConfiguration($params, 'Artshow_Configuration');
        $config = [];
        foreach ($data as $entry) {
            $config[$entry['field']] = $entry['value'];
        }

        if ($id != 'demo') {
            $select = Select::new($this->container->db);
            $select->columns('*')->from('Artshow_DisplayArt')->whereEquals(['PieceID' => $id, 'EventID' => $eid]);
            $data = $select->perform()->fetchAll();
            if (empty($data)) {
                throw new NotFoundException('Art Not Found');
            }
            $data = $data[0];

            $select = Select::new($this->container->db);
            $select->columns('*')->from('Artshow_DisplayArtPrice')->whereEquals(['PieceID' => $id, 'EventID' => $eid]);
            $prices = $select->perform()->fetchAll();
            if (empty($prices)) {
                throw new NotFoundException('Art Prices Not Found');
            }
            $data['prices'] = $prices;

            $aid = $data['ArtistID'];
            $select = Select::new($this->container->db);
            $select->columns('*')->from('Members as m')->from('Artshow_Artist as a')->whereEquals(['a.ArtistID' => $aid, 'm.AccountID' => 'a.AccountID']);
            $member = $select->perform()->fetchAll();
            if (empty($member)) {
                throw new NotFoundException('Member Not Found');
            }
            $member = $member[0];
            if ($member['CompanyNameOnSheet'] == 1) {
                $data['Artist'] = $member['CompanyName'];
            } else {
                $data['Artist'] = $member['FirstName'].' '.$member['LastName'];
            }
            $data['2dUri'] = \App\Modules\artshow\Controller\BidTag::build2DUri($request, $data);
            $dataset = [$data];
        } else {
            $dataset = [];
            for ($i = 0; $i < 12; $i++) {
                $dataset[$i] = [
                'PieceID' => "$i",
                'EventID' => '123',
                'ArtistID' => '123',
                'Name' => 'Awesome Example Art '.$i,
                'Medium' => 'Bits on Paper',
                'PieceType' => 'Normal',
                'Edition' => '1st',
                'NFS' => '0',
                'Charity' => '0',
                'NonTax' => '0',
                'Artist' => 'Artie Aarrtist'
                ];

                $prices = [];
                $select = Select::new($this->container->db);
                $select->columns('*')->from('Artshow_PriceType')->whereEquals(['SetPrice' => 1]);
                $p = $select->perform()->fetchAll();
                foreach ($p as $price) {
                    $prices[] = [
                    'PriceType' => $price['PriceType'],
                    'Price' => rand(1, 200)
                    ];
                }

                $dataset[$i]['prices'] = $prices;
                $dataset[$i]['2dUri'] = \App\Modules\artshow\Controller\BidTag::build2DUri($request, $dataset[$i]);
            }
        }

        if (\ciab\RBAC::havePermission('api.artshow.printTags') &&
            $request->getQueryParams('official', false)) {
            $update = Update::new($this->container->db);
            $update->table('Artshow_DisplayArt')->columns(['TagPrintCount' => 'TagPrintCount + 1'])->whereEquals(['PieceID' => $id, 'EventID' => $eid])->perform();
            $draft = false;
        } else {
            $draft = true;
        }

        $this->bidTag = new \App\Modules\artshow\Controller\BidTag($config);
        $output = $this->bidTag->buildTags($dataset, $draft);

        return [
        \App\Controller\BaseController::RESULT_TYPE,
        $output];

    }


    /* end GetTag */
}
