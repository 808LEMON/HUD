local vehicleHudVisible = false

local seatbelt = false
local cruise = false

local nitrousLevel = 0
local nitrousActive = false

local harnessHealth = 0

local currentOdometer = 0.0
local lastCoords = nil
local lastVehicle = 0

local function Clamp(value, minimum, maximum)

    return math.max(
        minimum,
        math.min(maximum, value)
    )

end

local function GetSpeed(vehicle)

    local speed = GetEntitySpeed(vehicle)

    if Config.UseMPH then
        return math.floor(speed * 2.236936)
    end

    return math.floor(speed * 3.6)

end

local function GetRPM(vehicle)

    local rpm = GetVehicleCurrentRpm(vehicle)

    rpm = Clamp(rpm, 0.0, 1.0)

    return rpm

end

local function GetGear(vehicle)

    local gear = GetVehicleCurrentGear(vehicle)

    local speed =
        GetEntitySpeed(vehicle)

    if gear == 0 then

        if speed < 0.5 then
            return 'N'
        end

        return 'R'

    end

    return tostring(gear)

end

local function GetFuel(vehicle)

    return math.floor(
        Clamp(
            GetVehicleFuelLevel(vehicle),
            0.0,
            100.0
        )
    )

end

local function GetEngineHealth(vehicle)

    local health =
        GetVehicleEngineHealth(vehicle)

    health =
        Clamp(health, 0.0, 1000.0)

    return math.floor(health / 10.0)

end

local function GetLightState(vehicle)

    local lightsOn, highBeamsOn =
        GetVehicleLightsState(vehicle)

    return lightsOn == 1,
           highBeamsOn == 1

end

local function UpdateOdometer(vehicle)

    local coords =
        GetEntityCoords(vehicle)

    if vehicle ~= lastVehicle then

        lastVehicle = vehicle
        lastCoords = coords

        return

    end

    if lastCoords then

        local distance =
            #(coords - lastCoords)

        if distance < 100.0 then
            currentOdometer =
                currentOdometer + distance
        end

    end

    lastCoords = coords

end

local function GetDisplayedMileage()

    if Config.UseMPH then

        return currentOdometer / 1609.344

    end

    return currentOdometer / 1000.0

end

local function UpdateVehicleHud(vehicle)

    UpdateOdometer(vehicle)

    local lightsOn, highBeams =
        GetLightState(vehicle)

    SendNUIMessage({
        action = 'updateVehicle',

        visible = true,

        speed = GetSpeed(vehicle),

        speedUnit =
            Config.UseMPH
                and 'MPH'
                or 'KM/H',

        rpm = GetRPM(vehicle),

        fuel = GetFuel(vehicle),

        engineHealth =
            GetEngineHealth(vehicle),

        gear = GetGear(vehicle),

        seatbelt = seatbelt,

        cruise = cruise,

        lights = lightsOn,

        highBeams = highBeams,

        nitrous = nitrousLevel,

        nitrousActive = nitrousActive,

        harness = harnessHealth,

        mileage =
            GetDisplayedMileage(),

        showRPM =
            Config.ShowRPM,

        showFuel =
            Config.ShowFuel,

        showGear =
            Config.ShowGear,

        showSeatbelt =
            Config.ShowSeatbelt,

        showEngineHealth =
            Config.ShowEngineHealth,

        showOdometer =
            Config.ShowOdometer,

        showHeadlights =
            Config.ShowHeadlights,

        showCruise =
            Config.ShowCruise
    })

end

RegisterNetEvent(
    'seatbelt:client:ToggleSeatbelt',
    function()

        seatbelt = not seatbelt

    end
)

RegisterNetEvent(
    'seatbelt:client:SetSeatbelt',
    function(state)

        seatbelt = state == true

    end
)

RegisterNetEvent(
    'hud:client:SetSeatbelt',
    function(state)

        seatbelt = state == true

    end
)

RegisterNetEvent(
    'seatbelt:client:ToggleCruise',
    function()

        cruise = not cruise

    end
)

RegisterNetEvent(
    'hud:client:UpdateNitrous',
    function(level, active)

        nitrousLevel =
            tonumber(level) or 0

        nitrousActive =
            active == true

    end
)

RegisterNetEvent(
    'hud:client:UpdateHarness',
    function(health)

        harnessHealth =
            tonumber(health) or 0

    end
)

RegisterNetEvent(
    'lemon-hud:client:setSeatbelt',
    function(state)

        seatbelt = state == true

    end
)

CreateThread(function()

    while true do

        local ped = PlayerPedId()

        if Config.VehicleHUD
        and IsPedInAnyVehicle(ped, false) then

            local vehicle =
                GetVehiclePedIsIn(
                    ped,
                    false
                )

            if DoesEntityExist(vehicle) then

                vehicleHudVisible = true

                UpdateVehicleHud(vehicle)

                Wait(
                    Config.VehicleUpdateInterval
                )

            else

                Wait(500)

            end

        else

            if vehicleHudVisible then

                vehicleHudVisible = false

                lastVehicle = 0
                lastCoords = nil

                SendNUIMessage({
                    action =
                        'updateVehicle',

                    visible = false
                })

            end

            Wait(500)

        end

    end

end)