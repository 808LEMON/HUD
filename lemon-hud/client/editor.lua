--=========================================================
-- 808LEMON HUD EDITOR
--=========================================================

local editorOpen = false

local savedLayout = nil
local workingLayout = nil

--=========================================================
-- NATIVE MINIMAP OFFSETS
--=========================================================

local minimapOffsetX = 0.0
local minimapOffsetY = 0.0


--=========================================================
-- DEEP COPY
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
-- DEFAULT LAYOUT
--=========================================================

local function GetDefaultLayout()

    local layout =
        DeepCopy(
            Config.HudEditor.DefaultLayout
        )

    --=====================================================
    -- Native minimap uses offsets instead of normal
    -- HTML x/y positions.
    --=====================================================

    layout.minimap = {

        offsetX = 0.0,
        offsetY = 0.0

    }

    return layout
end


--=========================================================
-- SANITIZE LAYOUT
--=========================================================

local function SanitizeLayout(layout)

    local defaults =
        GetDefaultLayout()

    if type(layout) ~= 'table' then

        return defaults

    end


    local clean = {}


    --=====================================================
    -- NORMAL HTML COMPONENTS
    --=====================================================

    local nuiComponents = {

        'player',
        'compass',
        'status',
        'vehicle'

    }


    for _, name in ipairs(
        nuiComponents
    ) do

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


    --=====================================================
    -- NATIVE MINIMAP
    --=====================================================

    local minimap =
        layout.minimap


    if type(minimap) ~= 'table' then

        minimap = {}

    end


    clean.minimap = {

        offsetX = Clamp(
            minimap.offsetX
            or 0.0,
            -0.08,
            0.68
        ),

        offsetY = Clamp(
            minimap.offsetY
            or 0.0,
            -0.70,
            0.08
        )

    }


    return clean
end


--=========================================================
-- APPLY NATIVE MINIMAP
--=========================================================

local function ApplyNativeMinimap(
    offsetX,
    offsetY
)

    offsetX =
        tonumber(offsetX)
        or 0.0

    offsetY =
        tonumber(offsetY)
        or 0.0


    local map =
        Config.Minimap.Map

    local mask =
        Config.Minimap.Mask

    local blur =
        Config.Minimap.Blur


    SetMinimapClipType(0)


    --=====================================================
    -- ACTUAL MAP
    --=====================================================

    SetMinimapComponentPosition(
        'minimap',
        'L',
        'B',

        map.x + offsetX,
        map.y + offsetY,

        map.width,
        map.height
    )


    --=====================================================
    -- MAP MASK
    --=====================================================

    SetMinimapComponentPosition(
        'minimap_mask',
        'L',
        'B',

        mask.x + offsetX,
        mask.y + offsetY,

        mask.width,
        mask.height
    )


    --=====================================================
    -- MAP BLUR
    --=====================================================

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
-- REFRESH RADAR
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


    --=====================================================
    -- APPLY HTML COMPONENTS
    --=====================================================

    SendNUIMessage({

        action =
            'applyHudLayout',

        layout =
            layout

    })


    --=====================================================
    -- APPLY NATIVE GTA MINIMAP
    --=====================================================

    ApplyNativeMinimap(
        minimapOffsetX,
        minimapOffsetY
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
-- SAVE LAYOUT
--=========================================================

local function SaveLayout(layout)

    savedLayout =
        SanitizeLayout(layout)


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
        DeepCopy(
            savedLayout
        )


    minimapOffsetX =
        workingLayout
            .minimap
            .offsetX
        or 0.0


    minimapOffsetY =
        workingLayout
            .minimap
            .offsetY
        or 0.0


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
            GetDefaultLayout()

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
            or
            GetDefaultLayout()
        )

    end


    SendNUIMessage({

        action =
            'closeHudEditor'

    })

end


--=========================================================
-- EDIT HUD COMMAND
--=========================================================

RegisterCommand(
    Config.HudEditor.Command,
    function()

        OpenEditor()

    end,
    false
)


--=========================================================
-- RESET HUD COMMAND
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
            DeepCopy(
                savedLayout
            )


        minimapOffsetX =
            0.0

        minimapOffsetY =
            0.0


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

    end,
    false
)


--=========================================================
-- NORMAL HUD PREVIEW
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


        if type(data) ~= 'table' then

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
-- MOVE NATIVE MINIMAP
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


        if type(data) ~= 'table' then

            cb({
                success = false
            })

            return

        end


        --=================================================
        -- Mouse movement sent from JavaScript as a
        -- normalized screen delta.
        --=================================================

        local dx =
            tonumber(
                data.dx
            )
            or 0.0


        local dy =
            tonumber(
                data.dy
            )
            or 0.0


        --=================================================
        -- HORIZONTAL
        --
        -- Positive = right
        -- Negative = left
        --=================================================

        minimapOffsetX =
            Clamp(
                minimapOffsetX + dx,
                -0.08,
                0.68
            )


        --=================================================
        -- VERTICAL
        --
        -- The native minimap uses bottom anchoring.
        --
        -- Mouse down = positive dy
        -- Native map down = positive offsetY
        --
        -- Because of how the B anchor behaves here,
        -- subtract the mouse delta.
        --=================================================

        minimapOffsetY =
            Clamp(
                minimapOffsetY - dy,
                -0.70,
                0.08
            )


        --=================================================
        -- UPDATE WORKING LAYOUT
        --=================================================

        if not workingLayout then

            workingLayout =
                GetDefaultLayout()

        end


        workingLayout.minimap = {

            offsetX =
                minimapOffsetX,

            offsetY =
                minimapOffsetY

        }


        --=================================================
        -- MOVE THE ACTUAL GTA RADAR
        --=================================================

        ApplyNativeMinimap(
            minimapOffsetX,
            minimapOffsetY
        )


        --=================================================
        -- RETURN CURRENT POSITION TO JS
        --=================================================

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
-- SAVE HUD
--=========================================================

RegisterNUICallback(
    'saveHudLayout',
    function(data, cb)

        if type(data) ~= 'table' then

            cb({
                success = false
            })

            return

        end


        local incoming =
            data.layout
            or {}


        --=================================================
        -- Force the actual native minimap values into
        -- the saved layout.
        --=================================================

        incoming.minimap = {

            offsetX =
                minimapOffsetX,

            offsetY =
                minimapOffsetY

        }


        SaveLayout(
            incoming
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
            DeepCopy(
                savedLayout
            )


        minimapOffsetX =
            0.0

        minimapOffsetY =
            0.0


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

            layout =
                savedLayout

        })

    end
)


--=========================================================
-- CANCEL EDITOR
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
-- RESOURCE START
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


--=========================================================
-- RESOURCE STOP SAFETY
--=========================================================

AddEventHandler(
    'onResourceStop',
    function(resourceName)

        if resourceName ~=
            GetCurrentResourceName()
        then
            return
        end


        if editorOpen then

            SetNuiFocus(
                false,
                false
            )

            SetNuiFocusKeepInput(
                false
            )

        end

    end
)