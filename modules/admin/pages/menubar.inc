<?php

require_once($BACKEND."/RBAC.inc");

if (\ciab\RBAC::havePermission("site.admin")) {
    $admin_menus[] = array('base style' => 'UI-yellow',
     'selected style' => 'event-color-primary',
     'function' => 'admin',
     'title' => 'Oh the administration',
     'i class' => 'fas fa-database',
     'text' => 'Database',
     'responsive' => true);
}

if (\ciab\RBAC::havePermission("asset.admin")) {
    $admin_menus[] = array('base style' => 'UI-yellow',
     'selected style' => 'event-color-primary',
     'function' => 'admin/asset',
     'title' => 'Page Asset Administraton',
     'i class' => 'fas fa-images',
     'text' => 'Assets',
     'responsive' => true);
}
