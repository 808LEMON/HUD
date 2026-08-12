--=========================================================
-- 808LEMON HUD
-- SQUARE MINIMAP CONTROLLER
--=========================================================

local radarVisible = false

local minimapScaleform = nil

local squaremapLoaded = false
local mapPatched = false

local lastSafezone = nil
local lastResolutionX = nil
local lastResolutionY = nil

--=========================================================
-- DEBUG
--=========================================================

local function DebugPrint(message)

    if Config.Debug then

        print(
            '[LEMON-HUD MINIMAP] '
            .. tostring(message)
        )

    end

end

--=========================================================
-- LOAD SQUAREMAP TEXTURE
--=========================================================

local function LoadSquaremap()

    if squaremapLoaded then
        return true
    end

    DebugPrint(
        'Loading squaremap texture dictionary...'
    )

    RequestStreamedTextureDict(
        'squaremap',
        false
    )

    local waited = 0

    while not HasStreamedTextureDictLoaded(
        'squaremap'
    ) do

        Wait(100)

        waited = waited + 100

        if waited >= 5000 then

            print(
                '[LEMON-HUD] squaremap.ytd failed to load.'
            )

            return false

        end

    end

    --=====================================================
    -- FORCE SQUARE CLIP
    --=====================================================

    SetMinimapClipType(0)

    --=====================================================
    -- REPLACE GTA RADAR MASKS
    --=====================================================

    AddReplaceTexture(
        'platform:/textures/graphics',
        'radarmasksm',
        'squaremap',
        'radarmasksm'
    )

    AddReplaceTexture(
        'platform:/textures/graphics',
        'radarmask1g',
        'squaremap',
        'radarmasksm'
    )

    squaremapLoaded = true

    DebugPrint(
        'Squaremap texture loaded.'
    )

    return true

end

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

        if GetGameTimer() > timeout then

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
-- HIDE DEFAULT GTA HEALTH / ARMOR
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
-- HIDE NORTH BLIP
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
-- ASPECT RATIO OFFSET
--=========================================================

local function GetBaseOffset()

    local aspectRatio =
        GetAspectRatio(false)

    if aspectRatio >
        (1920 / 1080)
    then

        return (
            (
                (1920 / 1080)
                - aspectRatio
            ) / 3.6
        ) - 0.008,
        aspectRatio

    end

    return 0.0,
           aspectRatio

end

--=========================================================
-- APPLY NATIVE COMPONENT POSITIONS
--=========================================================

local function ApplyComponentPositions()

    local baseOffset =
        GetBaseOffset()

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

        map.x + baseOffset,
        map.y,

        map.width,
        map.height
    )

    --=====================================================
    -- MASK / PLAYER BLIPS
    --=====================================================

    SetMinimapComponentPosition(
        'minimap_mask',
        'L',
        'B',

        mask.x + baseOffset,
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

        blur.x + baseOffset,
        blur.y,

        blur.width,
        blur.height
    )

end

--=========================================================
-- CALCULATE TRUE MINIMAP SCREEN GEOMETRY
--=========================================================

local function CalculateMinimapGeometry()

    SetBigmapActive(
        false,
        false
    )

    local resX, resY =
        GetActiveScreenResolution()

    if not resX
    or not resY
    or resX <= 0
    or resY <= 0
    then

        return nil

    end

    local baseOffset,
          aspectRatio =
        GetBaseOffset()

    --=====================================================
    -- FIND GTA MINIMAP ORIGIN
    --=====================================================

    SetScriptGfxAlign(
        string.byte('L'),
        string.byte('B')
    )

    local rawX, rawY =
        GetScriptGfxPosition(
            0.0,
            -0.227888
        )

    ResetScriptGfxAlign()

    --=====================================================
    -- SAFEZONE INSET
    --=====================================================

    SetScriptGfxAlign(
        string.byte('L'),
        string.byte('T')
    )

    local safeX, safeY =
        GetScriptGfxPosition(
            0.0,
            0.0
        )

    ResetScriptGfxAlign()

    --=====================================================
    -- CALCULATED RADAR SIZE
    --
    -- Same geometry method cx-hud uses.
    --=====================================================

    local width =
        resX /
        (
            3.48
            * aspectRatio
        )

    local height =
        resY / 5.55

    local left =
        (
            rawX
            + baseOffset
        ) * resX

    local top =
        rawY * resY

    return {

        left =
            math.floor(
                left + 0.5
            ),

        top =
            math.floor(
                top + 0.5
            ),

        width =
            math.floor(
                width + 0.5
            ),

        height =
            math.floor(
                height + 0.5
            ),

        insetX =
            math.floor(
                safeX
                * resX
                + 0.5
            ),

        insetY =
            math.floor(
                safeY
                * resY
                + 0.5
            )

    }

end

--=========================================================
-- SEND BORDER GEOMETRY TO NUI
--=========================================================

local function UpdateMinimapBorder()

    if not Config.MinimapBorder.enabled then

        SendNUIMessage({
            action = 'setMinimapBorder',
            visible = false
        })

        return

    end

    local geo =
        CalculateMinimapGeometry()

    if not geo then
        return
    end

    local padding =
        Config.MinimapBorder.padding
        or 0

    SendNUIMessage({

        action =
            'setMinimapBorder',

        visible =
            true,

        left =
            geo.left - padding,

        top =
            geo.top - padding,

        width =
            geo.width
            + (padding * 2),

        height =
            geo.height
            + (padding * 2)

    })

end

--=========================================================
-- PATCH MINIMAP
--=========================================================

local function PatchMinimap()

    if mapPatched then

        UpdateMinimapBorder()

        return

    end

    if not LoadSquaremap() then
        return
    end

    ApplyComponentPositions()

    HideNorthRadarBlip()

    HideDefaultHealthArmor()

    --=====================================================
    -- FORCE GTA TO REFRESH THE RADAR
    --=====================================================

    SetBigmapActive(
        true,
        false
    )

    Wait(0)

    SetBigmapActive(
        false,
        false
    )

    mapPatched = true

    Wait(50)

    UpdateMinimapBorder()

    DebugPrint(
        'Minimap patched.'
    )

end

--=========================================================
-- INITIALIZE
--=========================================================

CreateThread(function()

    Wait(1000)

    lastSafezone =
        GetSafeZoneSize()

    lastResolutionX,
    lastResolutionY =
        GetActiveScreenResolution()

    PatchMinimap()

end)

--=========================================================
-- KEEP STOCK HUD ELEMENTS DISABLED
--=========================================================

CreateThread(function()

    while true do

        HideNorthRadarBlip()

        HideDefaultHealthArmor()

        Wait(1000)

    end

end)

--=========================================================
-- WATCH SAFEZONE / RESOLUTION
--=========================================================

CreateThread(function()

    while true do

        Wait(2000)

        local currentSafezone =
            GetSafeZoneSize()

        local currentResX,
              currentResY =
            GetActiveScreenResolution()

        local needsRefresh =
            false

        if lastSafezone == nil
        or math.abs(
            currentSafezone
            - lastSafezone
        ) > 0.001
        then

            lastSafezone =
                currentSafezone

            needsRefresh =
                true

        end

        if currentResX ~=
            lastResolutionX
        or currentResY ~=
            lastResolutionY
        then

            lastResolutionX =
                currentResX

            lastResolutionY =
                currentResY

            needsRefresh =
                true

        end

        if needsRefresh then

            mapPatched =
                false

            Wait(100)

            PatchMinimap()

        end

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

            SendNUIMessage({

                action =
                    'setMinimapBorderVisible',

                visible =
                    radarVisible

            })

        end

        Wait(250)

    end

end)

--=========================================================
-- PLAYER LOADED
--=========================================================

RegisterNetEvent(
    'QBCore:Client:OnPlayerLoaded',
    function()

        Wait(1000)

        mapPatched =
            false

        PatchMinimap()

    end
)

--=========================================================
-- MANUAL REFRESH
--=========================================================

RegisterNetEvent(
    'lemon-hud:client:refreshMinimap',
    function()

        mapPatched =
            false

        PatchMinimap()

    end
)

--=========================================================
-- EXPORTS
--=========================================================

exports(
    'RefreshMinimap',
    function()

        mapPatched =
            false

        PatchMinimap()

    end
)

exports(
    'GetMinimapGeometry',
    function()

        return CalculateMinimapGeometry()

    end
)