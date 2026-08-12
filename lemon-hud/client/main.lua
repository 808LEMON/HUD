local QBCore = exports['qb-core']:GetCoreObject()

local PlayerData = {}

local hudVisible = true

local hunger = 100
local thirst = 100
local stress = 0


--=========================================================
-- HELPERS
--=========================================================

local function Clamp(value, minimum, maximum)

    value = tonumber(value) or minimum

    if value < minimum then
        return minimum
    end

    if value > maximum then
        return maximum
    end

    return value

end


local function SendHudMessage(data)

    SendNUIMessage(data)

end


--=========================================================
-- PLAYER DATA
--=========================================================

local function UpdatePlayerData()

    PlayerData =
        QBCore.Functions.GetPlayerData()

    if not PlayerData then
        PlayerData = {}
        return
    end


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

end


--=========================================================
-- JOB DATA
--=========================================================

local function GetPlayerJob()

    if not PlayerData
    or not PlayerData.job then

        return 'Unemployed', ''

    end


    local jobLabel =
        PlayerData.job.label
        or PlayerData.job.name
        or 'Unemployed'


    local gradeLabel = ''


    if PlayerData.job.grade then

        gradeLabel =
            PlayerData.job.grade.name
            or PlayerData.job.grade.label
            or ''

    end


    return jobLabel,
           gradeLabel

end


--=========================================================
-- HEALTH / STATUS VALUES
--=========================================================

local function GetStatusValues()

    local ped =
        PlayerPedId()


    if not DoesEntityExist(ped) then

        return 100,
               0,
               hunger,
               thirst

    end


    --=====================================================
    -- HEALTH
    --
    -- GTA player health normally uses:
    --
    -- 100 = zero usable health
    -- 200 = full usable health
    --
    -- We calculate against GetEntityMaxHealth so it will
    -- still work if another resource changes max health.
    --=====================================================

    local rawHealth =
        GetEntityHealth(ped)

    local rawMaxHealth =
        GetEntityMaxHealth(ped)


    local usableHealth =
        rawHealth - 100

    local usableMaxHealth =
        rawMaxHealth - 100


    if usableMaxHealth <= 0 then
        usableMaxHealth = 100
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
                GetPedArmour(ped),
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


    return health,
           armor,
           currentHunger,
           currentThirst

end


--=========================================================
-- SEND PLAYER INFORMATION
--=========================================================

local function SendPlayerInformation()

    if not hudVisible then
        return
    end


    local jobLabel,
          gradeLabel =
        GetPlayerJob()


    local cash = 0
    local bank = 0


    if PlayerData
    and PlayerData.money then

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
-- SEND STATUS INFORMATION
--=========================================================

local function SendStatusInformation()

    if not hudVisible then
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
-- UPDATE HUD
--=========================================================

local function UpdateHud()

    if not hudVisible then
        return
    end

    SendPlayerInformation()

    SendStatusInformation()

end


--=========================================================
-- PLAYER LOADED
--=========================================================

RegisterNetEvent(
    'QBCore:Client:OnPlayerLoaded',
    function()

        UpdatePlayerData()

        hudVisible = true


        SendHudMessage({

            action =
                'setVisible',

            visible =
                true

        })


        Wait(250)

        UpdateHud()

    end
)


--=========================================================
-- PLAYER UNLOADED
--=========================================================

RegisterNetEvent(
    'QBCore:Client:OnPlayerUnload',
    function()

        PlayerData = {}

        hudVisible = false


        SendHudMessage({

            action =
                'setVisible',

            visible =
                false

        })

    end
)


--=========================================================
-- PLAYER DATA UPDATED
--=========================================================

RegisterNetEvent(
    'QBCore:Player:SetPlayerData',
    function(data)

        PlayerData =
            data or {}


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


        UpdateHud()

    end
)


--=========================================================
-- JOB UPDATED
--=========================================================

RegisterNetEvent(
    'QBCore:Client:OnJobUpdate',
    function(job)

        PlayerData.job =
            job

        SendPlayerInformation()

    end
)


--=========================================================
-- QB-HUD COMPATIBILITY
-- NEEDS
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


        SendStatusInformation()

    end
)


--=========================================================
-- QB-HUD COMPATIBILITY
-- STRESS
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
-- LEMON HUD VISIBILITY
--=========================================================

RegisterNetEvent(
    'lemon-hud:client:setVisible',
    function(state)

        hudVisible =
            state == true


        SendHudMessage({

            action =
                'setVisible',

            visible =
                hudVisible

        })


        if hudVisible then

            UpdateHud()

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


        SendStatusInformation()

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
-- INITIAL THREAD
--=========================================================

CreateThread(function()

    Wait(1000)

    UpdatePlayerData()


    while true do

        UpdateHud()

        Wait(
            Config.UpdateInterval
            or 250
        )

    end

end)