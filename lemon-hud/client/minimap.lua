local radarVisible = false

local function ApplyBaseMinimapPosition()

    local map =
        Config.Minimap.Map

    local mask =
        Config.Minimap.Mask

    local blur =
        Config.Minimap.Blur

    SetMinimapClipType(0)

    --=====================================================
    -- MAP
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
    -- MASK
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
    -- BLUR
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

local function RefreshRadar()

    SetRadarBigmapEnabled(
        true,
        false
    )

    Wait(75)

    SetRadarBigmapEnabled(
        false,
        false
    )

end

--=========================================================
-- INITIALIZE
--=========================================================

CreateThread(function()

    Wait(750)

    ApplyBaseMinimapPosition()

    RefreshRadar()

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
-- MANUAL REFRESH
--=========================================================

RegisterNetEvent(
    'lemon-hud:client:refreshMinimap',
    function()

        ApplyBaseMinimapPosition()

        RefreshRadar()

    end
)