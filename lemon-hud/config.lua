Config = {}

Config.Debug = false

--=========================================================
-- GENERAL
--=========================================================

Config.UseMPH = true

Config.ShowPlayerStats = true

Config.ShowCompass = true
Config.ShowStreetNames = true

Config.ShowHealth = true
Config.ShowArmor = true
Config.ShowHunger = true
Config.ShowThirst = true

Config.HideArmorWhenEmpty = true

--=========================================================
-- MINIMAP
--=========================================================

Config.ShowMinimap = true
Config.MinimapOnlyInVehicle = false

Config.Minimap = {

    Map = {
        x = -0.0040,
        y = -0.0215,
        width = 0.1515,
        height = 0.1880
    },

    Mask = {
        x = 0.0200,
        y = 0.0320,
        width = 0.1110,
        height = 0.1590
    },

    Blur = {
        x = -0.0300,
        y = 0.0220,
        width = 0.2660,
        height = 0.2370
    }

}

--=========================================================
-- VEHICLE HUD
--=========================================================

Config.VehicleHUD = true

Config.ShowRPM = true
Config.ShowFuel = true
Config.ShowGear = true
Config.ShowSeatbelt = true
Config.ShowEngineHealth = true
Config.ShowOdometer = true
Config.ShowHeadlights = true
Config.ShowCruise = true

--=========================================================
-- UPDATE RATES
--=========================================================

Config.UpdateInterval = 250
Config.VehicleUpdateInterval = 75
Config.CompassUpdateInterval = 75

--=========================================================
-- HUD EDITOR
--=========================================================

Config.HudEditor = {}

Config.HudEditor.Command = 'edithud'
Config.HudEditor.ResetCommand = 'resethud'

Config.HudEditor.KvpName = 'lemon_hud_layout'

-- These are percentages of the screen.
--
-- x = distance from LEFT
-- y = distance from TOP
--
-- These are only the STARTING/default positions.
-- Once you drag everything where you want it, we can
-- replace these with your final official layout.

Config.HudEditor.DefaultLayout = {

    player = {
        x = 82.0,
        y = 2.0
    },

    compass = {
        x = 1.5,
        y = 64.0
    },

    minimap = {
        x = 1.55,
        y = 72.0
    },

    status = {
        x = 1.55,
        y = 88.0
    },

    vehicle = {
        x = 82.0,
        y = 68.0
    }

}

--=========================================================
-- MINIMAP EDITOR CALIBRATION
--=========================================================
--
-- GTA's minimap is native, while the editor uses HTML.
--
-- These values describe where the minimap appears visually
-- when using the Config.Minimap native values above.
--
-- When you drag the minimap box, lemon-hud calculates the
-- movement difference and applies that same movement to
-- minimap, mask and blur.

Config.HudEditor.MinimapReference = {

    x = Config.HudEditor.DefaultLayout.minimap.x,
    y = Config.HudEditor.DefaultLayout.minimap.y,

    width = 14.2,
    height = 15.0

}