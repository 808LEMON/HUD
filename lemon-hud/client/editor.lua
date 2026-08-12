local editorOpen = false

local savedLayout = nil
local workingLayout = nil

--=========================================================
-- COPY TABLE
--=========================================================

local function DeepCopy(value)

    if type(value) ~= 'table' then
        return value
    end

    local copy = {}

    for key, item in pairs(value) do

        copy[key] =
            DeepCopy(item)

    end

    return copy
end

--=========================================================
-- CLAMP
--=========================================================

local function Clamp(
    value,
    minimum,
    maximum
)

    value =
        tonumber(value)
        or minimum

    return math.max(
        minimum,
        math.min(
            maximum,
            value
        )
    )
end

--=========================================================
-- SANITIZE
--=========================================================

local function SanitizeLayout(layout)

    local defaults =
        Config.HudEditor.DefaultLayout

    if type(layout) ~= 'table' then

        return DeepCopy(
            defaults
        )

    end

    local clean = {}

    local components = {
        'player',
        'compass',
        'status',
        'vehicle',
        'minimap'
    }

    for _, name in ipairs(
        components
    ) do

        local default =
            defaults[name]

        local incoming =
            layout[name]

        if type(incoming) ~= 'table' then
            incoming = {}
        end

        clean[name] = {

            x = Clamp(
                incoming.x
                or default.x,

                -10,
                100
            ),

            y = Clamp(
                incoming.y
                or default.y,

                -10,
                100
            )

        }

    end

    return clean
end

--=========================================================
-- NATIVE MINIMAP
--=========================================================

local function ApplyNativeMinimap(layout)

    if not layout
    or not layout.minimap then
        return
    end

    local defaults =
        Config.HudEditor
            .DefaultLayout
            .minimap

    local position =
        layout.minimap

    -------------------------------------------------------
    -- Browser coordinates:
    --
    -- +X = right
    -- +Y = down
    --
    -- Native minimap using "B":
    --
    -- +X = right
    -- +Y behaves opposite vertically
    -------------------------------------------------------

    local deltaX =
        (
            position.x -
            defaults.x
        ) / 100.0

    local deltaY =
        (
            position.y -
            defaults.y
        ) / 100.0

    local map =
        Config.Minimap.Map

    local mask =
        Config.Minimap.Mask

    local blur =
        Config.Minimap.Blur

    -------------------------------------------------------
    -- MAP
    -------------------------------------------------------

    SetMinimapComponentPosition(
        'minimap',
        'L',
        'B',

        map.x + deltaX,
        map.y - deltaY,

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

        mask.x + deltaX,
        mask.y - deltaY,

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

    Wait(35)

    SetRadarBigmapEnabled(
        false,
        false
    )
end

--=========================================================
-- APPLY LAYOUT
--=========================================================

local function ApplyLayout(layout)

    layout =
        SanitizeLayout(
            layout
        )

    SendNUIMessage({

        action =
            'applyHudLayout',

        layout =
            layout

    })

    ApplyNativeMinimap(
        layout
    )
end

--=========================================================
-- LOAD SAVED
--=========================================================

local function LoadLayout()

    local raw =
        GetResourceKvpString(
            Config.HudEditor.KvpName
        )

    if not raw
    or raw == '' then

        savedLayout =
            DeepCopy(
                Config.HudEditor
                    .DefaultLayout
            )

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
            DeepCopy(
                Config.HudEditor
                    .DefaultLayout
            )

        return savedLayout

    end

    savedLayout =
        SanitizeLayout(
            decoded
        )

    return savedLayout
end

--=========================================================
-- SAVE
--=========================================================

local function SaveLayout(layout)

    savedLayout =
        SanitizeLayout(
            layout
        )

    SetResourceKvp(
        Config.HudEditor.KvpName,
        json.encode(
            savedLayout
        )
    )

    ApplyLayout(
        savedLayout
    )
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
        DeepCopy(
            savedLayout
        )

    editorOpen =
        true

    SetNuiFocus(
        true,
        true
    )

    SetNuiFocusKeepInput(
        false
    )

    SendNUIMessage({

        action =
            'openHudEditor',

        layout =
            workingLayout,

        defaults =
            Config.HudEditor
                .DefaultLayout

    })
end

--=========================================================
-- CLOSE
--=========================================================

local function CloseEditor(
    restoreSaved
)

    if not editorOpen then
        return
    end

    editorOpen =
        false

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
            Config.HudEditor
                .DefaultLayout
        )

    end

    SendNUIMessage({
        action =
            'closeHudEditor'
    })
end

--=========================================================
-- COMMAND
--=========================================================

RegisterCommand(
    Config.HudEditor.Command,
    function()

        OpenEditor()

    end,
    false
)

--=========================================================
-- RESET COMMAND
--=========================================================

RegisterCommand(
    Config.HudEditor.ResetCommand,
    function()

        DeleteResourceKvp(
            Config.HudEditor.KvpName
        )

        savedLayout =
            DeepCopy(
                Config.HudEditor
                    .DefaultLayout
            )

        workingLayout =
            DeepCopy(
                savedLayout
            )

        ApplyLayout(
            savedLayout
        )

        RefreshRadar()

    end,
    false
)

--=========================================================
-- LIVE PREVIEW
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

        ApplyNativeMinimap(
            workingLayout
        )

        cb({
            success = true
        })
    end
)

--=========================================================
-- SAVE CALLBACK
--=========================================================

RegisterNUICallback(
    'saveHudLayout',
    function(data, cb)

        SaveLayout(
            data.layout
        )

        workingLayout =
            DeepCopy(
                savedLayout
            )

        CloseEditor(
            false
        )

        cb({
            success = true
        })
    end
)

--=========================================================
-- RESET CALLBACK
--=========================================================

RegisterNUICallback(
    'resetHudLayout',
    function(_, cb)

        DeleteResourceKvp(
            Config.HudEditor.KvpName
        )

        savedLayout =
            DeepCopy(
                Config.HudEditor
                    .DefaultLayout
            )

        workingLayout =
            DeepCopy(
                savedLayout
            )

        ApplyLayout(
            savedLayout
        )

        RefreshRadar()

        SendNUIMessage({

            action =
                'hudEditorReset',

            layout =
                savedLayout

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

        CloseEditor(
            true
        )

        cb({
            success = true
        })
    end
)

--=========================================================
-- LOAD ON RESOURCE START
--=========================================================

CreateThread(function()

    Wait(1500)

    LoadLayout()

    ApplyLayout(
        savedLayout
    )

    Wait(100)

    RefreshRadar()

end)