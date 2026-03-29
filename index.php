<?php
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CyRO</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        #game {
            width: 100%;
            height: 100%;
        }
    </style>
    <script>
        window.ROConfigLocal = {
            development: false,
            remoteClient: 'https://cyro.live/grf/',
            registrationweb: 'https://cyro.live/?module=account&action=create',
            webserverAddress: 'https://cyro.live/api',
            servers: [{
                display: 'CyRO',
                desc: 'Play in RO in Browser',
                address: '127.0.0.1',
                port: 6900,
                version: 55,
                langtype: 240,
                packetver: 20211103,
                renewal: false,
                packetKeys: false,
                socketProxy: 'wss://cyro.live/ws/',
                adminList: [2000000]
            }],
            skipServerList: true,
            skipIntro: true
        };
    </script>
    <script src="/rb2/dist/Web/Config.js"></script>
    <script>
        function deepMerge(target, source) {
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        target[key] = deepMerge(target[key] || {}, source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        }

        window.addEventListener('load', function () {
            var config = deepMerge({}, window.ROConfigBase || {});
            if (window.ROConfigLocal) {
                config = deepMerge(config, window.ROConfigLocal);
            }
            window.ROConfig = config;

            var script = document.createElement('script');
            script.type = 'module';
            script.src = '/rb2/dist/Web/Online.js';
            document.body.appendChild(script);
        });
    </script>
</head>
<body>
    <div id="game"></div>
</body>
</html>
