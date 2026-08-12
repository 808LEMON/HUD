local QBCore = exports['qb-core']:GetCoreObject()

local PlayerData = {}
local hudVisible = true

local hunger = 100
local thirst = 100
local stress = 0

local function DebugPrint(message)
    if Config.Debug then
        print('[LEMON-HUD] ' .. tostring(message))
    end
end

local function SendHudMessage(data)
    SendNUIMessage(data)
end

local function UpdatePlayerData()
    PlayerData = QBCore.Functions.GetPlayerData()

    if not PlayerData then
        return
    end

    if PlayerData.metadata then
        hunger = PlayerData.metadata['hunger'] or hunger
        thirst = PlayerData.metadata['thirst'] or thirst
        stress = PlayerData.metadata['stress'] or stress
    end
end

local function GetPlayerJob()
    if not PlayerData or not PlayerData.job then
        return 'Unemployed', ''
    end

    local jobLabel = PlayerData.job.label or PlayerData.job.name or 'Unemployed'

    local gradeLabel = ''

    if PlayerData.job.grade then
        gradeLabel = PlayerData.job.grade.name or PlayerData.job.grade.label or ''
    end

    return jobLabel, gradeLabel
end

local function UpdatePlayerStats()
    if not hudVisible then
        return
    end

    local ped = PlayerPedId()

    if not DoesEntityExist(ped) then
        return
    end

    local health = GetEntityHealth(ped) - 100

    if health < 0 then
        health = 0
    end

    local maxHealth = GetEntityMaxHealth(ped) - 100

    if maxHealth <= 0 then
        maxHealth = 100
    end

    health = math.floor((health / maxHealth) * 100)

    local armor = GetPedArmour(ped)

    local jobLabel, gradeLabel = GetPlayerJob()

    local cash = 0
    local bank = 0

    if PlayerData.money then
        cash = PlayerData.money['cash'] or 0
        bank = PlayerData.money['bank'] or 0
    end

    SendHudMessage({
        action = 'updatePlayer',

        visible = Config.ShowPlayerStats,

        playerId = GetPlayerServerId(PlayerId()),

        cash = cash,
        bank = bank,

        job = jobLabel,
        grade = gradeLabel,

        health = health,
        armor = armor,
        hunger = hunger,
        thirst = thirst,

        showHealth = Config.ShowHealth,
        showArmor = Config.ShowArmor,
        showHunger = Config.ShowHunger,
        showThirst = Config.ShowThirst,

        hideArmorWhenEmpty = Config.HideArmorWhenEmpty
    })
end

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    UpdatePlayerData()

    SendHudMessage({
        action = 'setVisible',
        visible = true
    })
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    PlayerData = {}

    SendHudMessage({
        action = 'setVisible',
        visible = false
    })
end)

RegisterNetEvent('QBCore:Player:SetPlayerData', function(data)
    PlayerData = data

    if PlayerData.metadata then
        hunger = PlayerData.metadata['hunger'] or hunger
        thirst = PlayerData.metadata['thirst'] or thirst
        stress = PlayerData.metadata['stress'] or stress
    end
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function(job)
    PlayerData.job = job
end)

RegisterNetEvent('hud:client:UpdateNeeds', function(newHunger, newThirst)
    hunger = newHunger or hunger
    thirst = newThirst or thirst
end)

RegisterNetEvent('hud:client:UpdateStress', function(newStress)
    stress = newStress or stress
end)

RegisterNetEvent('lemon-hud:client:setVisible', function(state)
    hudVisible = state == true

    SendHudMessage({
        action = 'setVisible',
        visible = hudVisible
    })
end)

RegisterNetEvent('lemon-hud:client:updateNeeds', function(newHunger, newThirst)
    hunger = newHunger or hunger
    thirst = newThirst or thirst
end)

RegisterNetEvent('lemon-hud:client:updateStress', function(newStress)
    stress = newStress or stress
end)

CreateThread(function()
    Wait(1000)

    UpdatePlayerData()

    while true do
        UpdatePlayerStats()

        Wait(Config.UpdateInterval)
    end
end)