local QBCore =
    exports['qb-core']:GetCoreObject()


--=========================================================
-- PLAYER DATA
--=========================================================

local PlayerData = {}


--=========================================================
-- HUD SESSION STATE
--=========================================================

local hudVisible = false

local characterLoaded = false

local spawnFinished = false


--=========================================================
-- STATUS VALUES
--=========================================================

local hunger = 100

local thirst = 100

local stress = 0


--=========================================================
-- HELPERS
--=========================================================

local function Clamp(
    value,
    minimum,
    maximum
)

    value =
        tonumber(value)
        or minimum


    if value < minimum then
        return minimum
    end


    if value > maximum then
        return maximum
    end


    return value

end


--=========================================================
-- NUI
--=========================================================

local function SendHudMessage(data)

    SendNUIMessage(
        data
    )

end


--=========================================================
-- VISIBILITY
--=========================================================

local function SetHudVisible(state)

    hudVisible =
        state == true


    SendHudMessage({

        action =
            'setVisible',

        visible =
            hudVisible

    })

end


--=========================================================
-- HUD READY CHECK
--=========================================================

local function CanShowHud()

    return
        characterLoaded
        and spawnFinished

end


--=========================================================
-- REFRESH PLAYER DATA
--=========================================================

local function RefreshPlayerData()

    local latestData =
        QBCore.Functions.GetPlayerData()


    if latestData then

        PlayerData =
            latestData

    end


    if not PlayerData then

        PlayerData = {}

        return

    end


    if PlayerData.metadata then


        --=================================================
        -- HUNGER
        --=================================================

        if PlayerData.metadata['hunger'] ~= nil then

            hunger =
                tonumber(
                    PlayerData.metadata['hunger']
                )
                or hunger

        end


        --=================================================
        -- THIRST
        --=================================================

        if PlayerData.metadata['thirst'] ~= nil then

            thirst =
                tonumber(
                    PlayerData.metadata['thirst']
                )
                or thirst

        end


        --=================================================
        -- STRESS
        --=================================================

        if PlayerData.metadata['stress'] ~= nil then

            stress =
                tonumber(
                    PlayerData.metadata['stress']
                )
                or stress

        end

    end

end


--=========================================================
-- JOB
--=========================================================

local function GetPlayerJob()

    if not PlayerData
    or not PlayerData.job
    then

        return
            'Unemployed',
            ''

    end


    local jobLabel =
        PlayerData.job.label
        or PlayerData.job.name
        or 'Unemployed'


    local gradeLabel =
        ''


    if PlayerData.job.grade then

        gradeLabel =
            PlayerData.job.grade.name
            or PlayerData.job.grade.label
            or ''

    end


    return
        jobLabel,
        gradeLabel

end


--=========================================================
-- STATUS VALUES
--=========================================================

local function GetStatusValues()

    local ped =
        PlayerPedId()


    if not DoesEntityExist(ped) then

        return
            100,
            0,
            hunger,
            thirst

    end


    --=====================================================
    -- HEALTH
    --=====================================================

    local rawHealth =
        GetEntityHealth(
            ped
        )


    local rawMaxHealth =
        GetEntityMaxHealth(
            ped
        )


    local usableHealth =
        rawHealth - 100


    local usableMaxHealth =
        rawMaxHealth - 100


    if usableMaxHealth <= 0 then

        usableMaxHealth =
            100

    end


    local health =
        (
            usableHealth /
            usableMaxHealth
        ) * 100


    health =
        math.floor(
            Clamp(
                health,
                0,
                100
            )
        )


    --=====================================================
    -- ARMOR
    --=====================================================

    local armor =
        math.floor(
            Clamp(
                GetPedArmour(
                    ped
                ),
                0,
                100
            )
        )


    --=====================================================
    -- HUNGER
    --=====================================================

    local currentHunger =
        math.floor(
            Clamp(
                hunger,
                0,
                100
            )
        )


    --=====================================================
    -- THIRST
    --=====================================================

    local currentThirst =
        math.floor(
            Clamp(
                thirst,
                0,
                100
            )
        )


    return
        health,
        armor,
        currentHunger,
        currentThirst

end


--=========================================================
-- PLAYER INFORMATION
--=========================================================

local function SendPlayerInformation()

    if not hudVisible then
        return
    end


    if not CanShowHud() then
        return
    end


    RefreshPlayerData()


    local jobLabel,
          gradeLabel =
        GetPlayerJob()


    local cash = 0

    local bank = 0


    if PlayerData.money then

        cash =
            tonumber(
                PlayerData.money['cash']
            )
            or 0


        bank =
            tonumber(
                PlayerData.money['bank']
            )
            or 0

    end


    SendHudMessage({

        action =
            'updatePlayer',

        visible =
            Config.ShowPlayerStats,

        id =
            GetPlayerServerId(
                PlayerId()
            ),

        cash =
            cash,

        bank =
            bank,

        job =
            jobLabel,

        grade =
            gradeLabel

    })

end


--=========================================================
-- STATUS INFORMATION
--=========================================================

local function SendStatusInformation()

    if not hudVisible then
        return
    end


    if not CanShowHud() then
        return
    end


    local health,
          armor,
          currentHunger,
          currentThirst =
        GetStatusValues()


    SendHudMessage({

        action =
            'updateStatus',

        health =
            health,

        armor =
            armor,

        hunger =
            currentHunger,

        thirst =
            currentThirst,

        showHealth =
            Config.ShowHealth,

        showArmor =
            Config.ShowArmor,

        showHunger =
            Config.ShowHunger,

        showThirst =
            Config.ShowThirst,

        hideArmorWhenEmpty =
            Config.HideArmorWhenEmpty

    })

end


--=========================================================
-- FULL HUD UPDATE
--=========================================================

local function UpdateHud()

    if not hudVisible then
        return
    end


    if not CanShowHud() then
        return
    end


    SendPlayerInformation()

    SendStatusInformation()

end


--=========================================================
-- CHARACTER LOADED
--=========================================================

RegisterNetEvent(
    'QBCore:Client:OnPlayerLoaded',
    function()

        characterLoaded =
            true


        spawnFinished =
            false


        RefreshPlayerData()


        --=================================================
        -- IMPORTANT
        -- KEEP HUD HIDDEN DURING QB-SPAWN
        --=================================================

        SetHudVisible(
            false
        )

    end
)


--=========================================================
-- QB-SPAWN FINISHED
--=========================================================

RegisterNetEvent(
    'lemon-hud:client:spawnFinished',
    function()

        if not characterLoaded then
            return
        end


        spawnFinished =
            true


        RefreshPlayerData()


        -- Small delay so qb-spawn can finish fading/cameras

        Wait(
            150
        )


        SetHudVisible(
            true
        )


        Wait(
            100
        )


        UpdateHud()

    end
)


--=========================================================
-- PLAYER UNLOAD
--=========================================================

RegisterNetEvent(
    'QBCore:Client:OnPlayerUnload',
    function()

        PlayerData = {}


        characterLoaded =
            false


        spawnFinished =
            false


        SetHudVisible(
            false
        )

    end
)


--=========================================================
-- PLAYER DATA UPDATE
--=========================================================

RegisterNetEvent(
    'QBCore:Player:SetPlayerData',
    function(data)

        PlayerData =
            data
            or {}


        if PlayerData.metadata then


            if PlayerData.metadata['hunger'] ~= nil then

                hunger =
                    tonumber(
                        PlayerData.metadata['hunger']
                    )
                    or hunger

            end


            if PlayerData.metadata['thirst'] ~= nil then

                thirst =
                    tonumber(
                        PlayerData.metadata['thirst']
                    )
                    or thirst

            end


            if PlayerData.metadata['stress'] ~= nil then

                stress =
                    tonumber(
                        PlayerData.metadata['stress']
                    )
                    or stress

            end

        end


        if hudVisible
        and CanShowHud()
        then

            UpdateHud()

        end

    end
)


--=========================================================
-- JOB UPDATE
--=========================================================

RegisterNetEvent(
    'QBCore:Client:OnJobUpdate',
    function(job)

        PlayerData.job =
            job


        if hudVisible
        and CanShowHud()
        then

            SendPlayerInformation()

        end

    end
)


--=========================================================
-- NEEDS COMPATIBILITY
--=========================================================

RegisterNetEvent(
    'hud:client:UpdateNeeds',
    function(
        newHunger,
        newThirst
    )

        if newHunger ~= nil then

            hunger =
                Clamp(
                    newHunger,
                    0,
                    100
                )

        end


        if newThirst ~= nil then

            thirst =
                Clamp(
                    newThirst,
                    0,
                    100
                )

        end


        if hudVisible
        and CanShowHud()
        then

            SendStatusInformation()

        end

    end
)


--=========================================================
-- STRESS COMPATIBILITY
--=========================================================

RegisterNetEvent(
    'hud:client:UpdateStress',
    function(newStress)

        if newStress ~= nil then

            stress =
                Clamp(
                    newStress,
                    0,
                    100
                )

        end

    end
)


--=========================================================
-- MONEY CHANGE COMPATIBILITY
--=========================================================

RegisterNetEvent(
    'hud:client:OnMoneyChange',
    function(
        moneyType,
        amount,
        isMinus
    )

        Wait(
            50
        )


        RefreshPlayerData()


        if not hudVisible
        or not CanShowHud()
        then

            return

        end


        local cash = 0

        local bank = 0


        if PlayerData.money then

            cash =
                tonumber(
                    PlayerData.money['cash']
                )
                or 0


            bank =
                tonumber(
                    PlayerData.money['bank']
                )
                or 0

        end


        SendHudMessage({

            action =
                'moneyChanged',

            moneyType =
                moneyType,

            amount =
                tonumber(amount)
                or 0,

            isMinus =
                isMinus == true,

            cash =
                cash,

            bank =
                bank

        })


        SendPlayerInformation()

    end
)


--=========================================================
-- SHOW ACCOUNTS COMPATIBILITY
--=========================================================

RegisterNetEvent(
    'hud:client:ShowAccounts',
    function()

        RefreshPlayerData()


        if hudVisible
        and CanShowHud()
        then

            SendPlayerInformation()

        end

    end
)


--=========================================================
-- LEMON HUD VISIBILITY
--=========================================================

RegisterNetEvent(
    'lemon-hud:client:setVisible',
    function(state)

        if state == true then


            if not CanShowHud() then

                SetHudVisible(
                    false
                )

                return

            end


            SetHudVisible(
                true
            )


            UpdateHud()


        else


            SetHudVisible(
                false
            )

        end

    end
)


--=========================================================
-- LEMON HUD NEEDS
--=========================================================

RegisterNetEvent(
    'lemon-hud:client:updateNeeds',
    function(
        newHunger,
        newThirst
    )

        if newHunger ~= nil then

            hunger =
                Clamp(
                    newHunger,
                    0,
                    100
                )

        end


        if newThirst ~= nil then

            thirst =
                Clamp(
                    newThirst,
                    0,
                    100
                )

        end


        if hudVisible
        and CanShowHud()
        then

            SendStatusInformation()

        end

    end
)


--=========================================================
-- LEMON HUD STRESS
--=========================================================

RegisterNetEvent(
    'lemon-hud:client:updateStress',
    function(newStress)

        if newStress ~= nil then

            stress =
                Clamp(
                    newStress,
                    0,
                    100
                )

        end

    end
)


--=========================================================
-- INITIAL RESOURCE START
--=========================================================

CreateThread(function()

    -- Give NUI enough time to initialize.

    Wait(
        250
    )


    --=====================================================
    -- ALWAYS START HIDDEN
    --=====================================================

    SetHudVisible(
        false
    )

end)


--=========================================================
-- MAIN HUD LOOP
--=========================================================

CreateThread(function()

    while true do


        if hudVisible
        and CanShowHud()
        then

            RefreshPlayerData()


            UpdateHud()


            Wait(
                Config.UpdateInterval
                or 250
            )


        else


            Wait(
                500
            )

        end

    end

end)