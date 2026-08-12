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

--=========================================================
-- SQUARE MINIMAP
--
-- These are the same baseline geometry values used by
-- cx-hud for its square map.
--=========================================================

Config.Minimap = {

    Map = {
        x = 0.0000,
        y = -0.0470,
        width = 0.1638,
        height = 0.1830
    },

    Mask = {
        x = 0.0000,
        y = 0.0000,
        width = 0.1280,
        height = 0.2000
    },

    Blur = {
        x = -0.0100,
        y = 0.0250,
        width = 0.2620,
        height = 0.3000
    }

}

--=========================================================
-- MINIMAP BORDER
--=========================================================

Config.MinimapBorder = {
    enabled = true,

    -- Small visual padding around calculated radar bounds.
    padding = 2
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

Config.HudEditor.DefaultLayout = {

    player = {
        x = 82.0,
        y = 2.0
    },

    compass = {
        x = 43.5,
        y = 0.0
    },

    status = {
        x = 0.8,
        y = 53.8
    },

    vehicle = {
        x = 82.0,
        y = 68.0
    }

}