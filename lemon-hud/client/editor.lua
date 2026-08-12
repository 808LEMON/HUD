--=========================================================
-- 808LEMON HUD EDITOR
--=========================================================

local editorOpen = false

local savedLayout = nil
local workingLayout = nil

--=========================================================
-- HELPERS
--=========================================================

local function DeepCopy(value)

    if type(value) ~= 'table' then
        return value
    end

    local result = {}

    for key, item in pairs(value) do
        result[key] = DeepCopy(item)
    end

    return result

end

local function Clamp(value, minimum, maximum)

    value = tonumber(value) or minimum

    return math.max(
        minimum,
        math.min(maximum, value)
    )

end

--=========================================================
-- DEFAULT LAYOUT
--=========================================================

local function GetDefaultLayout()

    return DeepCopy(
        Config.HudEditor.DefaultLayout
    )

end

--=========================================================
-- SANITIZE
--=========================================================

local function SanitizeLayout(layout)

    local defaults = GetDefaultLayout()

    if type(layout) ~= 'table' then
        return defaults
    end

    local clean = {}

    --=====================================================
    -- STANDARD NUI COMPONENTS
    --=====================================================

    local components = {
        'player',
        'compass',
        'status',
        'vehicle'
    }

    for _, name in ipairs(components) do

        local incoming = layout[name]

        if type(incoming) ~= 'table' then
            incoming = {}
        end

        clean[name] = {

            x = Clamp(
                incoming.x or defaults[name].x,
                0.0,
                100.0
            ),

            y = Clamp(
                incoming.y or defaults[name].y,
                0.0,
                100.0
            )

        }

    end

    --=====================================================
    -- MINIMAP FRAME
    --=====================================================

    local incomingMinimap = layout.minimap

    if type(incomingMinimap) ~= 'table' then
        incomingMinimap = {}
    end

    clean.minimap = {

        x = Clamp(
            incomingMinimap.x or defaults.minimap.x,
            0.0,
            100.0 - Config.MinimapFrame.width
        ),

        y = Clamp(
            incomingMinimap.y or defaults.minimap.y,
            0.0,
            100.0 - Config.MinimapFrame.height
        )

    }

    return clean

end

--=========================================================
-- APPLY NATIVE MINIMAP FROM ABSOLUTE FRAME POSITION
--=========================================================

local function ApplyNativeMinimap(frameX, frameY)

    frameX = tonumber(frameX) or Config.MinimapFrame.x
    frameY = tonumber(frameY) or Config.MinimapFrame.y

    --=====================================================
    -- IMPORTANT
    --
    -- HTML position uses percentage from:
    --
    -- LEFT / TOP
    --
    -- Native minimap uses normalized screen values and
    -- bottom anchoring.
    --
    -- We calculate EVERYTHING from the original/default
    -- reference on every update.
    --
    -- Nothing accumulates.
    --=====================================================

    local deltaXPercent =
        frameX -
        Config.MinimapFrame.x

    local deltaYPercent =
        frameY -
        Config.MinimapFrame.y

    local deltaX =
        deltaXPercent / 100.0

    local deltaY =
        deltaYPercent / 100.0

    local map = Config.Minimap.Map
    local mask = Config.Minimap.Mask
    local blur = Config.Minimap.Blur

    SetMinimapClipType(0)

    --=====================================================
    -- MAP
    --=====================================================

    SetMinimapComponentPosition(
        'minimap',
        'L',
        'B',

        map.x + deltaX,

        -- HTML Y increases going DOWN.
        -- Native bottom-anchored Y works opposite.
        map.y - deltaY,

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

        mask.x + deltaX,
        mask.y - deltaY,

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

        blur.x + deltaX,
        blur.y - deltaY,

        blur.width,
        blur.height
    )

end

--=========================================================
-- RADAR REFRESH
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
-- APPLY ENTIRE LAYOUT
--=========================================================

local function ApplyLayout(layout)

    layout = SanitizeLayout(layout)

    --=====================================================
    -- HTML / NUI
    --=====================================================

    SendNUIMessage({

        action = 'applyHudLayout',

        layout = layout,

        minimapFrame = {
            width = Config.MinimapFrame.width,
            height = Config.MinimapFrame.height
        }

    })

    --=====================================================
    -- ACTUAL GTA RADAR
    --=====================================================

    ApplyNativeMinimap(
        layout.minimap.x,
        layout.minimap.y
    )

end

--=========================================================
-- LOAD SAVED LAYOUT
--=========================================================

local function LoadLayout()

    local raw =
        GetResourceKvpString(
            Config.HudEditor.KvpName
        )

    if not raw or raw == '' then

        savedLayout =
            GetDefaultLayout()

        return savedLayout

    end

    local success, decoded =
        pcall(
            json.decode,
            raw
        )

    if not success
    or type(decoded) ~= 'table' then

        savedLayout =
            GetDefaultLayout()

        return savedLayout

    end

    savedLayout =
        SanitizeLayout(decoded)

    return savedLayout

end

--=========================================================
-- SAVE
--=========================================================

local function SaveLayout(layout)

    savedLayout =
        SanitizeLayout(layout)

    SetResourceKvp(
        Config.HudEditor.KvpName,
        json.encode(savedLayout)
    )

    ApplyLayout(savedLayout)

end

--=========================================================
-- OPEN
--=========================================================

local function OpenEditor()

    if editorOpen then
        return
    end

    if not savedLayout then
        LoadLayout()
    end

    workingLayout =
        DeepCopy(savedLayout)

    editorOpen = true

    SetNuiFocus(
        true,
        true
    )

    SetNuiFocusKeepInput(false)

    SendNUIMessage({

        action = 'openHudEditor',

        layout = workingLayout,

        defaults =
            GetDefaultLayout(),

        minimapFrame = {
            width = Config.MinimapFrame.width,
            height = Config.MinimapFrame.height
        }

    })

end

--=========================================================
-- CLOSE
--=========================================================

local function CloseEditor(restoreSaved)

    if not editorOpen then
        return
    end

    editorOpen = false

    SetNuiFocus(
        false,
        false
    )

    SetNuiFocusKeepInput(false)

    if restoreSaved then

        ApplyLayout(
            savedLayout
            or GetDefaultLayout()
        )

    end

    SendNUIMessage({
        action = 'closeHudEditor'
    })

end

--=========================================================
-- /edithud
--=========================================================

RegisterCommand(
    Config.HudEditor.Command,
    function()

        OpenEditor()

    end,
    false
)

--=========================================================
-- /resethud
--=========================================================

RegisterCommand(
    Config.HudEditor.ResetCommand,
    function()

        DeleteResourceKvp(
            Config.HudEditor.KvpName
        )

        savedLayout =
            GetDefaultLayout()

        workingLayout =
            DeepCopy(savedLayout)

        ApplyLayout(savedLayout)

        RefreshRadar()

        SendNUIMessage({

            action = 'hudEditorReset',

            layout = savedLayout,

            minimapFrame = {
                width = Config.MinimapFrame.width,
                height = Config.MinimapFrame.height
            }

        })

    end,
    false
)

--=========================================================
-- PREVIEW NORMAL HUD
--=========================================================

RegisterNUICallback(
    'previewHudLayout',
    function(data, cb)

        if not editorOpen then

            cb({
                success = false
            })

            return

        end

        if type(data) ~= 'table'
        or type(data.layout) ~= 'table' then

            cb({
                success = false
            })

            return

        end

        workingLayout =
            SanitizeLayout(
                data.layout
            )

        cb({
            success = true
        })

    end
)

--=========================================================
-- ABSOLUTE MINIMAP POSITION
--=========================================================

RegisterNUICallback(
    'setMinimapPosition',
    function(data, cb)

        if not editorOpen then

            cb({
                success = false
            })

            return

        end

        if type(data) ~= 'table' then

            cb({
                success = false
            })

            return

        end

        local x =
            Clamp(
                data.x,
                0.0,
                100.0 - Config.MinimapFrame.width
            )

        local y =
            Clamp(
                data.y,
                0.0,
                100.0 - Config.MinimapFrame.height
            )

        if not workingLayout then
            workingLayout = GetDefaultLayout()
        end

        workingLayout.minimap = {
            x = x,
            y = y
        }

        --=================================================
        -- ABSOLUTE POSITION.
        --
        -- No delta accumulation.
        --=================================================

        ApplyNativeMinimap(
            x,
            y
        )

        cb({

            success = true,

            x = x,
            y = y

        })

    end
)

--=========================================================
-- SAVE
--=========================================================

RegisterNUICallback(
    'saveHudLayout',
    function(data, cb)

        if type(data) ~= 'table'
        or type(data.layout) ~= 'table' then

            cb({
                success = false
            })

            return

        end

        local incoming =
            SanitizeLayout(
                data.layout
            )

        --=================================================
        -- Use working minimap position, because that is
        -- the actual radar position currently previewed.
        --=================================================

        if workingLayout
        and workingLayout.minimap then

            incoming.minimap =
                DeepCopy(
                    workingLayout.minimap
                )

        end

        SaveLayout(incoming)

        workingLayout =
            DeepCopy(savedLayout)

        CloseEditor(false)

        cb({
            success = true
        })

    end
)

--=========================================================
-- RESET FROM EDITOR
--=========================================================

RegisterNUICallback(
    'resetHudLayout',
    function(_, cb)

        DeleteResourceKvp(
            Config.HudEditor.KvpName
        )

        savedLayout =
            GetDefaultLayout()

        workingLayout =
            DeepCopy(savedLayout)

        ApplyLayout(savedLayout)

        RefreshRadar()

        SendNUIMessage({

            action = 'hudEditorReset',

            layout = savedLayout,

            minimapFrame = {
                width = Config.MinimapFrame.width,
                height = Config.MinimapFrame.height
            }

        })

        cb({

            success = true,

            layout = savedLayout

        })

    end
)

--=========================================================
-- CANCEL
--=========================================================

RegisterNUICallback(
    'closeHudEditor',
    function(_, cb)

        CloseEditor(true)

        cb({
            success = true
        })

    end
)

--=========================================================
-- EXTERNAL EVENT
--=========================================================

RegisterNetEvent(
    'lemon-hud:client:openEditor',
    function()

        OpenEditor()

    end
)

--=========================================================
-- INITIAL LOAD
--=========================================================

CreateThread(function()

    Wait(1600)

    LoadLayout()

    ApplyLayout(savedLayout)

    Wait(100)

    RefreshRadar()

end)

--=========================================================
-- RESOURCE STOP
--=========================================================

AddEventHandler(
    'onResourceStop',
    function(resourceName)

        if resourceName ~=
            GetCurrentResourceName()
        then
            return
        end

        SetNuiFocus(
            false,
            false
        )

        SetNuiFocusKeepInput(false)

    end
)