local radarVisible = false

local minimapScaleform = nil

--=========================================================
-- APPLY BASE MINIMAP
--=========================================================

local function ApplyBaseMinimapPosition()

    local map = Config.Minimap.Map
    local mask = Config.Minimap.Mask
    local blur = Config.Minimap.Blur

    SetMinimapClipType(0)

    SetMinimapComponentPosition(
        'minimap',
        'L',
        'B',
        map.x,
        map.y,
        map.width,
        map.height
    )

    SetMinimapComponentPosition(
        'minimap_mask',
        'L',
        'B',
        mask.x,
        mask.y,
        mask.width,
        mask.height
    )

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
-- REFRESH RADAR
--=========================================================

local function RefreshRadar()

    SetRadarBigmapEnabled(true, false)

    Wait(50)

    SetRadarBigmapEnabled(false, false)
end

--=========================================================
-- REMOVE GTA HEALTH / ARMOR BARS
--=========================================================

local function HideDefaultHealthArmor()

    if not minimapScaleform then

        minimapScaleform =
            RequestScaleformMovie('minimap')

    end

    if not HasScaleformMovieLoaded(
        minimapScaleform
    ) then
        return
    end

    BeginScaleformMovieMethod(
        minimapScaleform,
        'SETUP_HEALTH_ARMOUR'
    )

    -- 3 removes GTA's stock health/armor bars
    -- while leaving the radar itself active.
    ScaleformMovieMethodAddParamInt(3)

    EndScaleformMovieMethod()
end

--=========================================================
-- INITIALIZE
--=========================================================

CreateThread(function()

    minimapScaleform =
        RequestScaleformMovie('minimap')

    while not HasScaleformMovieLoaded(
        minimapScaleform
    ) do

        Wait(50)

    end

    Wait(500)

    ApplyBaseMinimapPosition()

    RefreshRadar()

    Wait(100)

    HideDefaultHealthArmor()

end)

--=========================================================
-- KEEP STOCK HEALTH/ARMOR DISABLED
--=========================================================

CreateThread(function()

    while true do

        HideDefaultHealthArmor()

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

        if shouldShow ~= radarVisible then

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
-- BASE RESET
--=========================================================

RegisterNetEvent(
    'lemon-hud:client:resetNativeMinimap',
    function()

        ApplyBaseMinimapPosition()

        RefreshRadar()

        HideDefaultHealthArmor()

    end
)

--=========================================================
-- EXPORT
--=========================================================

exports(
    'HideDefaultHealthArmor',
    function()

        HideDefaultHealthArmor()

    end
)