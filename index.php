<?php
// nocache
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if(!isset($_GET["md-file"])) {
    // die("<span style='color:red'>Failed. No md-file URL query or GET url param.</span>");
    include("views/list-directories.php");
} else {
    if (substr($_GET["md-file"], -3) === ".md") {
        $_GET["md-file"] = substr($_GET["md-file"], 0, -3);
    }
    include("views/tabularize-exercises.php");
}
?>