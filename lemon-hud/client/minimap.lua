--=========================================================
-- 808LEMON HUD
-- NATIVE GTA MINIMAP CONTROLLER
--=========================================================

local radarVisible = false
local minimapScaleform = nil

--=========================================================
-- LOAD MINIMAP SCALEFORM
--=========================================================

local function LoadMinimapScaleform()

    if minimapScaleform
    and HasScaleformMovieLoaded(
        minimapScaleform
    ) then
        return true
    end

    minimapScaleform =
        RequestScaleformMovie(
            'minimap'
        )

    local timeout =
        GetGameTimer() + 5000

    while not HasScaleformMovieLoaded(
        minimapScaleform
    ) do

        if GetGameTimer() >
            timeout
        then

            print(
                '[LEMON-HUD] Failed to load minimap scaleform.'
            )

            return false
        end

        Wait(25)

    end

    return true
end

--=========================================================
-- HIDE STOCK HEALTH / ARMOR
--=========================================================

local function HideDefaultHealthArmor()

    if not LoadMinimapScaleform() then
        return
    end

    BeginScaleformMovieMethod(
        minimapScaleform,
        'SETUP_HEALTH_ARMOUR'
    )

    ScaleformMovieMethodAddParamInt(
        3
    )

    EndScaleformMovieMethod()
end

--=========================================================
-- HIDE STOCK NORTH INDICATOR
--=========================================================

local function HideNorthRadarBlip()

    local northBlip =
        GetNorthRadarBlip()

    if northBlip
    and northBlip ~= 0 then

        SetBlipAlpha(
            northBlip,
            0
        )

    end
end

--=========================================================
-- APPLY MINIMAP COMPONENT POSITIONS
--=========================================================

local function ApplyMinimapPosition()

    local map =
        Config.Minimap.Map

    local mask =
        Config.Minimap.Mask

    local blur =
        Config.Minimap.Blur

    --=====================================================
    -- SQUARE CLIP
    --=====================================================

    SetMinimapClipType(
        0
    )

    --=====================================================
    -- ACTUAL MAP FEED
    --=====================================================

    SetMinimapComponentPosition(
        'minimap',
        'L',
        'B',

        map.x,
        map.y,

        map.width,
        map.height
    )

    --=====================================================
    -- ICON / BLIP MASK
    --
    -- THIS IS CRITICAL.
    -- Do NOT give this the same dimensions as the map.
    --=====================================================

    SetMinimapComponentPosition(
        'minimap_mask',
        'L',
        'B',

        mask.x,
        mask.y,

        mask.width,
        mask.height
    )

    --=====================================================
    -- BLUR / BACKING LAYER
    --=====================================================

    SetMinimapComponentPosition(
        'minimap_blur',
        'L',
        'B',

        blur.x,
        blur.y,

        blur.width,
        blur.height
    )

end

--=========================================================
-- REFRESH MAP
--=========================================================

local function RefreshRadar()

    SetRadarBigmapEnabled(
        true,
        false
    )

    Wait(50)

    SetRadarBigmapEnabled(
        false,
        false
    )

end

--=========================================================
-- INITIAL SETUP
--=========================================================

CreateThread(function()

    Wait(750)

    LoadMinimapScaleform()

    ApplyMinimapPosition()

    RefreshRadar()

    Wait(100)

    HideDefaultHealthArmor()

    HideNorthRadarBlip()

end)

--=========================================================
-- KEEP STOCK MINIMAP UI DISABLED
--
-- GTA or other resources can reinitialize this stuff,
-- so lightly reassert it.
--=========================================================

CreateThread(function()

    while true do

        HideDefaultHealthArmor()

        HideNorthRadarBlip()

        Wait(1000)

    end

end)

--=========================================================
-- RADAR VISIBILITY
--=========================================================

CreateThread(function()

    while true do

        local ped =
            PlayerPedId()

        local shouldShow =
            Config.ShowMinimap

        if Config.MinimapOnlyInVehicle then

            shouldShow =
                IsPedInAnyVehicle(
                    ped,
                    false
                )

        end

        if shouldShow ~=
            radarVisible
        then

            radarVisible =
                shouldShow

            DisplayRadar(
                radarVisible
            )

        end

        Wait(250)

    end

end)

--=========================================================
-- PLAYER LOAD
--=========================================================

RegisterNetEvent(
    'QBCore:Client:OnPlayerLoaded',
    function()

        Wait(750)

        ApplyMinimapPosition()

        RefreshRadar()

        Wait(100)

        HideDefaultHealthArmor()

        HideNorthRadarBlip()

    end
)

--=========================================================
-- MANUAL REFRESH
--=========================================================

RegisterNetEvent(
    'lemon-hud:client:refreshMinimap',
    function()

        ApplyMinimapPosition()

        RefreshRadar()

        Wait(50)

        HideDefaultHealthArmor()

        HideNorthRadarBlip()

    end
)

--=========================================================
-- EXPORT
--=========================================================

exports(
    'RefreshMinimap',
    function()

        ApplyMinimapPosition()

        RefreshRadar()

        HideDefaultHealthArmor()

        HideNorthRadarBlip()

    end
)

exports(
    'HideDefaultHealthArmor',
    function()

        HideDefaultHealthArmor()

    end
)