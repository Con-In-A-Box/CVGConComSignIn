<?php

/*.
    require_module 'standard';
.*/

namespace concom\panes;

require_once(__DIR__.'/../functions/concom.inc');


function draw_status()
{
    // Display Current ConCom Status
    echo "<div class='CONCOM-status'>\n";
    echo "<table class='UI-stripedtable'>\n";
    echo "<tr><th class='CONCOM-status-title'>Current ConCom Status</th></tr>\n";
    foreach ($_SESSION['customFields']['currConComPos'] as $val) {
        echo "<tr><td>".$val['position']." of ".$val['department'];
        if (!empty($val['note'])) {
            echo " - Note: ".$val['note'];
        }
        echo "</td></tr>\n";
        unset($pos);
        unset($tmp);
    }
    unset($val);
    unset($positionsHeld);
    echo "</table>\n";
    echo "</div>\n";

}


function draw_history()
{
    $events = events_served($_SESSION['accountId']);
    $c = count($events);

    echo "<div class='UI-container event-color-primary'>\n";
    echo "<table class='UI-stripedtable'>\n";
    echo "<tr><th style=\"text-align:center;\" class=\"event-color-primary\" colspan=5>Served on ConCom for ".$c;
    if ($c > 1) {
        echo " Events!  ";
    } else {
        echo " Event!  ";
    }
    echo "</th></tr>";

    $i = 0;
    foreach ($events as $val) {
        if ($i % 5 == 0) {
            if ($i != 0) {
                echo "</tr>\n";
            }
            echo "<tr>";
        }
        echo "<td>".$val."</td>";
        $i++;
    }
    echo "</tr>\n";
    echo "<tr class=\"event-color-primary\" ><th colspan=5 class='UI-center'>";
    echo "Thank you for your help!</th></tr>";
    echo "</table>\n";
    echo "</div>\n";

}


function phone_number()
{
    // If this person is on ConCom, but hasn't elected about their phone number, nudge them
    if (!empty($_SESSION['customFields']['currConComPos']) && !isset($_SESSION['accountInfo']['DisplayPhone'])) {
        echo '<p class="UI-container UI-center">';
        echo "We've noticed you haven't decided about your phone number.<br />";
        echo 'Please <a href="index.php?Function=profile">Update Your Profile</a> to make that selection.';
        echo '</p>';
    }

}


function meetings()
{
    // Display Meeting Sign In Info
    echo "<div class='UI-container event-color-primary'>\n";
    echo "<table class='UI-stripedtable'>\n";
    echo "<tr><th class='UI-center event-color-primary' colspan=3>Official Meeting Attendance</th></tr>\n";
    $nowDate = date("Y-m-d");

    $sql = "SELECT * from `OfficialMeetings` WHERE Date >= DATE_SUB(NOW(),INTERVAL 1 YEAR);";
    $result = \DB::run($sql);
    $value = $result->fetch();
    while ($value !== false) {
        $checkDate = $value['Date'];
        $attend = check_meeting_attendance($value['MeetingID']);

        if ($nowDate >= $value['Date']) {
            echo "<tr><td>".$value['Date']."</td>";
            echo "<td>".$value['Name']."</td>";
            if ($attend) {
                echo "<td class='CONCOM-checkin'>Checked In";
            } else {
                if ($nowDate == $checkDate) {
                    echo "<td class='CONCOM-checkin-now'><a href='index.php?Function=concom/signin&meeting=".$value['MeetingID']."'>Sign In Now!</a>";
                } else {
                    echo "<td>";
                    $checkPending = check_meeting_pastrequest($value['MeetingID']);

                    if ($checkPending) {
                        echo "Not Checked In - Attendance request pending";
                    } else {
                        echo "<form action='index.php?Function=concom/pastcredit&meeting=".$value['MeetingID']."' method='post' name='butiwasthere' id='butiwasthere'>";
                        echo "<input type='hidden' name='meeting' value='".$value['MeetingID']."'>";
                        echo "Not Checked In - <button class='UI-orangebutton'>But I attended!</button>";
                        echo "</form>";
                    }
                }
            }
            echo "</td></tr>\n";
        }
        $value = $result->fetch();
    }
    echo "</table>\n";
    echo "</div>\n";

}


if (!empty($_SESSION['customFields']['currConComPos'])) {
    $homepage_panes[] = 'concom\panes\phone_number';
    $homepage_panes[] = 'concom\panes\draw_status';
    $homepage_panes[] = 'concom\panes\meetings';
}
if (count(events_served($_SESSION['accountId']))) {
    $homepage_panes[] = 'concom\panes\draw_history';
}
