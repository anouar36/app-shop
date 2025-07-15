<?php

foreach (glob(__DIR__ . '/config/*.php') as $file) {
    echo "🔍 Checking $file\n";
    $val = include $file;
    if (!is_array($val)) {
        echo "❌ خطأ في الملف: $file\n";
    }
}
