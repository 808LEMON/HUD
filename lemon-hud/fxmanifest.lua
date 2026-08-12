fx_version 'cerulean'
game 'gta5'

author '808Lemon'
description '808Lemon QBCore HUD Replacement'
version '1.0.0'

lua54 'yes'

shared_scripts {
    'config.lua'
}

client_scripts {
    'client/main.lua',
    'client/vehicle.lua',
    'client/compass.lua',
    'client/minimap.lua',
    'client/compatibility.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',

    'html/css/main.css',
    'html/css/player.css',
    'html/css/vehicle.css',
    'html/css/compass.css',
    'html/css/status.css',

    'html/js/app.js'
}

dependency 'qb-core'