<?php declare(strict_types=1);
/*.
    require_module 'standard';
.*/

function setupArtshowAPI($app, $authMiddleware)
{
    $app->group(
        '/artshow',
        function () use ($app, $authMiddleware) {
            $app->get('[/]', 'App\Modules\artshow\Controller\GetInformation');
            $app->get('/artists', 'App\Modules\artshow\Controller\Artist\ListArtists');

            $app->group(
                '/artist',
                function () use ($app, $authMiddleware) {
                    $app->get('[/{artist}]', 'App\Modules\artshow\Controller\Artist\GetArtist');
                    $app->get('/member/{id}', 'App\Modules\artshow\Controller\Artist\GetAccountArtist');
                    $app->put('/{artist}', 'App\Modules\artshow\Controller\Artist\PutArtist');
                    $app->post('[/]', 'App\Modules\artshow\Controller\Artist\PostArtist');
                    $app->get('/{artist}/show', 'App\Modules\artshow\Controller\Show\GetArtistShow');
                    $app->post('/{artist}/show', 'App\Modules\artshow\Controller\Show\PostArtistShow');
                    $app->put('/{artist}/show', 'App\Modules\artshow\Controller\Show\PutArtistShow');
                    $app->get('/{artist}/art', 'App\Modules\artshow\Controller\Art\GetArt');
                    $app->post('/{artist}/art', 'App\Modules\artshow\Controller\Art\PostArt');
                    $app->get('/{artist}/print', 'App\Modules\artshow\Controller\PrintArt\GetPrint');
                    $app->post('/{artist}/print', 'App\Modules\artshow\Controller\PrintArt\PostPrint');
                    $app->get('/{artist}/tags', 'App\Modules\artshow\Controller\Artist\GetTag');
                }
            )->add(new App\Middleware\CiabMiddleware($app))->add($authMiddleware);


            $app->group(
                '/art',
                function () use ($app, $authMiddleware) {
                    $app->get('[/]', 'App\Modules\artshow\Controller\Art\GetArt');
                    $app->get('/piece/{piece}', 'App\Modules\artshow\Controller\Art\GetArt');
                    $app->get('/tag/{piece}', 'App\Modules\artshow\Controller\Art\GetTag');
                    $app->post('[/]', 'App\Modules\artshow\Controller\Art\PostArt');
                    $app->put('/{piece}', 'App\Modules\artshow\Controller\Art\PutArt');
                    $app->delete('/{piece}', 'App\Modules\artshow\Controller\Art\DeleteArt');
                }
            )->add(new App\Middleware\CiabMiddleware($app))->add($authMiddleware);

            $app->group(
                '/print',
                function () use ($app, $authMiddleware) {
                    $app->get('[/{piece}]', 'App\Modules\artshow\Controller\PrintArt\GetPrint');
                    $app->put('[/]', 'App\Modules\artshow\Controller\PrintArt\PutPrint');
                    $app->put('/{piece}', 'App\Modules\artshow\Controller\PrintArt\PutPrint');
                    $app->delete('/{piece}', 'App\Modules\artshow\Controller\PrintArt\DeletePrint');
                }
            )->add(new App\Middleware\CiabMiddleware($app))->add($authMiddleware);

            $app->group(
                '/event',
                function () use ($app, $authMiddleware) {
                    $app->get('/art[/{piece}]', 'App\Modules\artshow\Controller\Art\GetArt');
                    $app->get('/print[/{piece}]', 'App\Modules\artshow\Controller\PrintArt\GetPrint');
                }
            )->add(new App\Middleware\CiabMiddleware($app))->add($authMiddleware);

            $app->group(
                '/configuration',
                function () use ($app, $authMiddleware) {
                    $app->get('/paymenttype[/[{type}]]', 'App\Modules\artshow\Controller\Configuration\GetPaymentType');
                    $app->put('/paymenttype/{type}', 'App\Modules\artshow\Controller\Configuration\PutPaymentType');
                    $app->post('/paymenttype', 'App\Modules\artshow\Controller\Configuration\PostPaymentType');
                    $app->delete('/paymenttype/{type}', 'App\Modules\artshow\Controller\Configuration\DeletePaymentType');

                    $app->get('/piecetype[/[{type}]]', 'App\Modules\artshow\Controller\Configuration\GetPieceType');
                    $app->put('/piecetype/{type}', 'App\Modules\artshow\Controller\Configuration\PutPieceType');
                    $app->post('/piecetype', 'App\Modules\artshow\Controller\Configuration\PostPieceType');
                    $app->delete('/piecetype/{type}', 'App\Modules\artshow\Controller\Configuration\DeletePieceType');

                    $app->get('/returnmethod[/[{type}]]', 'App\Modules\artshow\Controller\Configuration\GetReturnMethod');
                    $app->put('/returnmethod/{type}', 'App\Modules\artshow\Controller\Configuration\PutReturnMethod');
                    $app->post('/returnmethod', 'App\Modules\artshow\Controller\Configuration\PostReturnMethod');
                    $app->delete('/returnmethod/{type}', 'App\Modules\artshow\Controller\Configuration\DeleteReturnMethod');

                    $app->get('/pricetype[/[{type}]]', 'App\Modules\artshow\Controller\Configuration\GetPriceType');
                    $app->put('/pricetype/{type}', 'App\Modules\artshow\Controller\Configuration\PutPriceType');
                    $app->post('/pricetype', 'App\Modules\artshow\Controller\Configuration\PostPriceType');
                    $app->delete('/pricetype/{type}', 'App\Modules\artshow\Controller\Configuration\DeletePriceType');

                    $app->get('/registrationquestion[/[{type}]]', 'App\Modules\artshow\Controller\Configuration\GetRegistrationQuestion');
                    $app->put('/registrationquestion/{type}', 'App\Modules\artshow\Controller\Configuration\PutRegistrationQuestion');
                    $app->post('/registrationquestion', 'App\Modules\artshow\Controller\Configuration\PostRegistrationQuestion');
                    $app->delete('/registrationquestion/{type}', 'App\Modules\artshow\Controller\Configuration\DeleteRegistrationQuestion');

                    $app->get('[/{key}]', 'App\Modules\artshow\Controller\Configuration\GetConfiguration');
                    $app->put('[/]', 'App\Modules\artshow\Controller\Configuration\PutConfiguration');
                }
            )->add(new App\Middleware\CiabMiddleware($app))->add($authMiddleware);
        }
    )->add(new App\Middleware\CiabMiddleware($app))->add($authMiddleware);

}
