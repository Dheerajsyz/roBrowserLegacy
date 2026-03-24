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
        window.ROConfig = {
            development: true,
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
    <script src="/robrowser/src/Vendors/require.js"></script>
    <script>
        require.config({
            baseUrl: '/robrowser/src/'
        });
        require(['App/Online']);
    </script>
</head>
<body>
    <div id="game"></div>
</body>
</html>
