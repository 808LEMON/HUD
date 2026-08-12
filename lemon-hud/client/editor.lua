local editorOpen = false

local savedLayout = nil
local workingLayout = nil

--=========================================================
-- HELPERS
--=========================================================

local function DeepCopy(original)

    if type(original) ~= 'table' then
        return original
    end

    local copy = {}

    for key, value in pairs(original) do

        if type(value) == 'table' then
            copy[key] = DeepCopy(value)
        else
            copy[key] = value
        end

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

local function SanitizeLayout(layout)

    local defaults =
        Config.HudEditor.DefaultLayout

    if type(layout) ~= 'table' then
        return DeepCopy(defaults)
    end

    local clean = {}

    local components = {
        'player',
        'compass',
        'status',
        'vehicle',
        'minimap'
    }

    for _, name in ipairs(components) do

        local default =
            defaults[name]

        local incoming =
            layout[name]

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

    return clean
end

--=========================================================
-- MINIMAP
--=========================================================

local function ApplyNativeMinimap(layout)

    if not layout
    or not layout.minimap then
        return
    end

    local defaults =
        Config.HudEditor.DefaultLayout.minimap

    local position =
        layout.minimap

    -------------------------------------------------------
    -- Editor coordinates are percentages.
    --
    -- Convert movement from the default editor position
    -- into GTA normalized HUD coordinates.
    -------------------------------------------------------

    local deltaX =
        (position.x - defaults.x) / 100.0

    local deltaY =
        (position.y - defaults.y) / 100.0

    -------------------------------------------------------
    -- MAP
    -------------------------------------------------------

    local map =
        Config.Minimap.Map

    SetMinimapComponentPosition(
        'minimap',
        'L',
        'B',

        map.x + deltaX,

        -- Native bottom anchoring works opposite to
        -- browser top coordinates.
        map.y - deltaY,

        map.width,
        map.height
    )

    -------------------------------------------------------
    -- MASK
    -------------------------------------------------------

    local mask =
        Config.Minimap.Mask

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

    local blur =
        Config.Minimap.Blur

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
-- APPLY LAYOUT
--=========================================================

local function ApplyLayout(layout)

    layout =
        SanitizeLayout(layout)

    SendNUIMessage({
        action = 'applyHudLayout',
        layout = layout
    })

    ApplyNativeMinimap(layout)
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
            DeepCopy(
                Config.HudEditor.DefaultLayout
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
                Config.HudEditor.DefaultLayout
            )

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
-- OPEN EDITOR
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
            Config.HudEditor.DefaultLayout
    })
end

--=========================================================
-- CLOSE EDITOR
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
            or Config.HudEditor.DefaultLayout
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
            DeepCopy(
                Config.HudEditor.DefaultLayout
            )

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

        ---------------------------------------------------
        -- Only the native minimap needs Lua-side preview.
        -- Normal NUI elements move directly in JS.
        ---------------------------------------------------

        ApplyNativeMinimap(
            workingLayout
        )

        cb({
            success = true
        })
    end
)

--=========================================================
-- SAVE
--=========================================================

RegisterNUICallback(
    'saveHudLayout',
    function(data, cb)

        local layout =
            SanitizeLayout(
                data.layout
            )

        SaveLayout(layout)

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
            DeepCopy(
                Config.HudEditor.DefaultLayout
            )

        workingLayout =
            DeepCopy(savedLayout)

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
-- EXTERNAL OPEN EVENT
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

    Wait(1500)

    LoadLayout()

    ApplyLayout(savedLayout)

    Wait(150)

    RefreshRadar()
end)