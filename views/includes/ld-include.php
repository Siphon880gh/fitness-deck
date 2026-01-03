<?php

$relativePathing = ".";

/* SETUP: Setup listing */
function glob_recursive($pattern, $flags = 0)
{
    $files = glob($pattern, $flags);
    // foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR) as $dir)
    foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir)
{
    $files = array_merge($files, glob_recursive($dir.'/'.basename($pattern), $flags));
}
    return $files;
}

/**
 * Keep debugFilenames in case an OS or server migration fails to load
 */
function debugFilenames($filepaths) {
    foreach ($filepaths as $filepath) {
        $filename = basename($filepath);       // Get the filename
        $folder = basename(dirname($filepath)); // Get the last folder
    
        echo "File: $filename\n";
        echo "Folder: $folder\n";
        echo "\n";
    }
}


$filepaths = glob_recursive("$relativePathing/md-file/*\.md");
//debugFilenames($filepaths);

// Filter out .up.md files (supplementary notes files)
$filepaths = array_values(array_filter($filepaths, function($filepath) {
    return substr($filepath, -6) !== '.up.md';
}));

$associativeArray = array_map(function($filepath) {
    return ['folder' => basename(dirname($filepath)), 'file' => substr(basename($filepath), 0, -3)];
}, $filepaths);

$relativePaths = array_map(function($filepath) {
    return basename(dirname($filepath)) . "/" . basename($filepath);
}, $filepaths);

?>