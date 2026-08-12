local radarVisible = false

local function ApplyMinimapPosition()

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

    SetRadarBigmapEnabled(
        true,
        false
    )

    Wait(100)

    SetRadarBigmapEnabled(
        false,
        false
    )

end


CreateThread(function()

    Wait(1000)

    ApplyMinimapPosition()

end)


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


RegisterNetEvent(
    'lemon-hud:client:refreshMinimap',
    function()

        ApplyMinimapPosition()

    end
)