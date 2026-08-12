local editorOpen = false

local savedLayout = nil
local workingLayout = nil

-- Native minimap editor offsets.
-- These are DELTAS from Config.Minimap.
local minimapOffsetX = 0.0
local minimapOffsetY = 0.0

--=========================================================
-- HELPERS
--=========================================================

local function DeepCopy(value)

    if type(value) ~= 'table' then
        return value
    end

    local copy = {}

    for key, item in pairs(value) do
        copy[key] = DeepCopy(item)
    end

    return copy
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

    local layout =
        DeepCopy(
            Config.HudEditor.DefaultLayout
        )

    -- Minimap is treated differently from NUI components.
    layout.minimap = {
        offsetX = 0.0,
        offsetY = 0.0
    }

    return layout
end

--=========================================================
-- SANITIZE
--=========================================================

local function SanitizeLayout(layout)

    local defaults =
        GetDefaultLayout()

    if type(layout) ~= 'table' then
        return defaults
    end

    local clean = {}

    -------------------------------------------------------
    -- NUI COMPONENTS
    -------------------------------------------------------

    local nuiComponents = {
        'player',
        'compass',
        'status',
        'vehicle'
    }

    for _, name in ipairs(nuiComponents) do

        local incoming =
            layout[name]

        local default =
            defaults[name]

        if type(incoming) ~= 'table' then
            incoming = {}
        end

        clean[name] = {

            x = Clamp(
                incoming.x or default.x,
                0.0,
                100.0
            ),

            y = Clamp(
                incoming.y or default.y,
                0.0,
                100.0
            )

        }

    end

    -------------------------------------------------------
    -- MINIMAP
    -------------------------------------------------------

    local minimap =
        layout.minimap

    if type(minimap) ~= 'table' then
        minimap = {}
    end

    clean.minimap = {

        offsetX = Clamp(
            minimap.offsetX or 0.0,
            -0.50,
            0.75
        ),

        offsetY = Clamp(
            minimap.offsetY or 0.0,
            -0.75,
            0.75
        )

    }

    return clean
end

--=========================================================
-- APPLY NATIVE MINIMAP
--=========================================================

local function ApplyNativeMinimap(offsetX, offsetY)

    offsetX =
        tonumber(offsetX) or 0.0

    offsetY =
        tonumber(offsetY) or 0.0

    local map =
        Config.Minimap.Map

    local mask =
        Config.Minimap.Mask

    local blur =
        Config.Minimap.Blur

    SetMinimapClipType(0)

    -------------------------------------------------------
    -- MAP
    -------------------------------------------------------

    SetMinimapComponentPosition(
        'minimap',
        'L',
        'B',

        map.x + offsetX,
        map.y + offsetY,

        map.width,
        map.height
    )

    -------------------------------------------------------
    -- MASK
    -------------------------------------------------------

    SetMinimapComponentPosition(
        'minimap_mask',
        'L',
        'B',

        mask.x + offsetX,
        mask.y + offsetY,

        mask.width,
        mask.height
    )

    -------------------------------------------------------
    -- BLUR
    -------------------------------------------------------

    SetMinimapComponentPosition(
        'minimap_blur',
        'L',
        'B',

        blur.x + offsetX,
        blur.y + offsetY,

        blur.width,
        blur.height
    )

end

--=========================================================
-- REFRESH
--=========================================================

local function RefreshRadar()

    SetRadarBigmapEnabled(
        true,
        false
    )

    Wait(40)

    SetRadarBigmapEnabled(
        false,
        false
    )
end

--=========================================================
-- APPLY FULL LAYOUT
--=========================================================

local function ApplyLayout(layout)

    layout =
        SanitizeLayout(layout)

    minimapOffsetX =
        layout.minimap.offsetX

    minimapOffsetY =
        layout.minimap.offsetY

    -------------------------------------------------------
    -- NUI
    -------------------------------------------------------

    SendNUIMessage({

        action = 'applyHudLayout',

        layout = layout

    })

    -------------------------------------------------------
    -- GTA MINIMAP
    -------------------------------------------------------

    ApplyNativeMinimap(
        minimapOffsetX,
        minimapOffsetY
    )
end

--=========================================================
-- LOAD
--=========================================================

local function LoadLayout()

    local raw =
        GetResourceKvpString(
            Config.HudEditor.KvpName
        )

    if not raw
    or raw == '' then

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

    minimapOffsetX =
        workingLayout.minimap.offsetX or 0.0

    minimapOffsetY =
        workingLayout.minimap.offsetY or 0.0

    editorOpen = true

    SetNuiFocus(
        true,
        true
    )

    SetNuiFocusKeepInput(
        false
    )

    SendNUIMessage({

        action = 'openHudEditor',

        layout = workingLayout,

        defaults =
            GetDefaultLayout()

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

    SetNuiFocusKeepInput(
        false
    )

    if restoreSaved then

        ApplyLayout(
            savedLayout
            or
            GetDefaultLayout()
        )

    end

    SendNUIMessage({
        action = 'closeHudEditor'
    })
end

--=========================================================
-- COMMANDS
--=========================================================

RegisterCommand(
    Config.HudEditor.Command,
    function()

        OpenEditor()

    end,
    false
)

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

            layout = savedLayout

        })

    end,
    false
)

--=========================================================
-- NORMAL NUI PREVIEW
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
-- MINIMAP MOVEMENT
--=========================================================

RegisterNUICallback(
    'moveMinimap',
    function(data, cb)

        if not editorOpen then

            cb({
                success = false
            })

            return
        end

        ---------------------------------------------------
        -- JS sends movement since the LAST mouse event.
        --
        -- dx / dy are normalized fractions of the screen.
        ---------------------------------------------------

        local dx =
            tonumber(data.dx)
            or 0.0

        local dy =
            tonumber(data.dy)
            or 0.0

        ---------------------------------------------------
        -- Horizontal
        ---------------------------------------------------

        minimapOffsetX =
            Clamp(
                minimapOffsetX + dx,
                -0.50,
                0.75
            )

        ---------------------------------------------------
        -- Vertical
        --
        -- Native B anchor:
        -- negative moves upward.
        ---------------------------------------------------

        minimapOffsetY =
            Clamp(
                minimapOffsetY - dy,
                -0.75,
                0.75
            )

        ---------------------------------------------------
        -- SAVE TO WORKING LAYOUT
        ---------------------------------------------------

        workingLayout.minimap = {

            offsetX =
                minimapOffsetX,

            offsetY =
                minimapOffsetY

        }

        ---------------------------------------------------
        -- MOVE ACTUAL GTA RADAR
        ---------------------------------------------------

        ApplyNativeMinimap(
            minimapOffsetX,
            minimapOffsetY
        )

        cb({

            success = true,

            offsetX =
                minimapOffsetX,

            offsetY =
                minimapOffsetY

        })

    end
)

--=========================================================
-- SAVE
--=========================================================

RegisterNUICallback(
    'saveHudLayout',
    function(data, cb)

        local incoming =
            data.layout
            or {}

        ---------------------------------------------------
        -- Make sure native minimap offsets are what
        -- actually get saved.
        ---------------------------------------------------

        incoming.minimap = {

            offsetX =
                minimapOffsetX,

            offsetY =
                minimapOffsetY

        }

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
-- RESET
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

        minimapOffsetX = 0.0
        minimapOffsetY = 0.0

        ApplyLayout(savedLayout)

        RefreshRadar()

        SendNUIMessage({

            action = 'hudEditorReset',

            layout = savedLayout

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
-- RESOURCE START
--=========================================================

CreateThread(function()

    Wait(1500)

    LoadLayout()

    ApplyLayout(savedLayout)

    Wait(100)

    RefreshRadar()

end)