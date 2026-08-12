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
-- HUD LAYOUT
--=========================================================
-- The NUI compass/status panels use 15vw.
-- The native minimap is tuned to match that footprint.

Config.HudWidth = 15.0

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