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
-- MINIMAP STYLE
--=========================================================

Config.MinimapStyle = 'square'

--=========================================================
-- SQUARE MINIMAP
--
-- Based on the current qb-hud style of positioning:
-- map, mask and blur deliberately use DIFFERENT values.
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
-- CUSTOM MINIMAP BORDER
--
-- NUI border only.
-- Does NOT control the native minimap.
-- We'll calibrate this after the native map is fixed.
--=========================================================

Config.MinimapBorder = {
    enabled = true,

    x = 1.55,
    y = 72.6,

    width = 14.3,
    height = 17.1
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
--
-- Leave this configured, but don't use minimap editing yet.
--=========================================================

Config.HudEditor = {}

Config.HudEditor.Command = 'edithud'
Config.HudEditor.ResetCommand = 'resethud'

Config.HudEditor.KvpName = 'lemon_hud_layout_v2'

Config.HudEditor.DefaultLayout = {

    player = {
        x = 82.0,
        y = 2.0
    },

    compass = {
        x = 1.5,
        y = 64.0
    },

    status = {
        x = 1.5,
        y = 88.0
    },

    vehicle = {
        x = 82.0,
        y = 68.0
    }

}