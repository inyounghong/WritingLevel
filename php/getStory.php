<?php

include('simple_html_dom.php');

if (isset($_GET['url']) && !empty($_GET['url'])) {
    getText($_GET['url']);
} else {
    echo "Invalid Page URL";
}

/* Echos the actual text of the story */
function getText($url) {
    $html = file_get_html($url);
    $storyText = $html->find('div[id=storytext] p');
    $periods = ["Mrs.", "Mr.", "Dr.", "Ms."];
    foreach ($storyText as $p) {
        $text = $p->plaintext;
        foreach ($periods as $period) {
            $text = str_replace($period, rtrim($period, "."), $text);
        }
        echo $text . " ";
    }
}

?>
