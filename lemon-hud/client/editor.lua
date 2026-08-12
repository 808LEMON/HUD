--=========================================================
-- 808LEMON HUD EDITOR
-- TEMP VERSION - MINIMAP EDITING DISABLED
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
        math.min(
            maximum,
            value
        )
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

    local defaults =
        GetDefaultLayout()

    if type(layout) ~= 'table' then
        return defaults
    end

    local clean = {}

    local components = {
        'player',
        'compass',
        'status',
        'vehicle'
    }

    for _, name in ipairs(components) do

        local incoming =
            layout[name]

        local default =
            defaults[name]

        if type(incoming) ~= 'table' then
            incoming = {}
        end

        clean[name] = {

            x = Clamp(
                incoming.x
                or default.x,
                0.0,
                100.0
            ),

            y = Clamp(
                incoming.y
                or default.y,
                0.0,
                100.0
            )

        }

    end

    return clean
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
end


--=========================================================
-- LOAD SAVED LAYOUT
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

        action = 'openHudEditor',

        layout = workingLayout,

        defaults =
            GetDefaultLayout(),

        minimapEditing = false

    })
end


--=========================================================
-- CLOSE EDITOR
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
            or GetDefaultLayout()
        )

    end

    SendNUIMessage({

        action =
            'closeHudEditor'

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

        SendNUIMessage({

            action =
                'hudEditorReset',

            layout =
                savedLayout

        })

    end,
    false
)


--=========================================================
-- PREVIEW NORMAL HUD COMPONENTS
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
-- SAVE CALLBACK
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

        SaveLayout(
            data.layout
        )

        workingLayout =
            DeepCopy(savedLayout)

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
            GetDefaultLayout()

        workingLayout =
            DeepCopy(savedLayout)

        ApplyLayout(savedLayout)

        SendNUIMessage({

            action =
                'hudEditorReset',

            layout =
                savedLayout

        })

        cb({

            success = true,

            layout =
                savedLayout

        })
    end
)


--=========================================================
-- CLOSE CALLBACK
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

    Wait(1500)

    LoadLayout()

    ApplyLayout(savedLayout)

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

        SetNuiFocusKeepInput(
            false
        )

    end
)