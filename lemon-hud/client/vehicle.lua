--=========================================================
-- 808LEMON HUD
-- VEHICLE HUD
-- QBCORE / QB-FUEL
--=========================================================


local vehicleHudVisible = false

local seatbelt = false
local cruise = false

local nitrousLevel = 0
local nitrousActive = false

local harnessHealth = 0

local currentOdometer = 0.0
local lastCoords = nil
local lastVehicle = 0


--=========================================================
-- HELPERS
--=========================================================

local function Clamp(value, minimum, maximum)

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
-- SPEED
--=========================================================

local function GetSpeed(vehicle)

    local speed =
        GetEntitySpeed(vehicle)

    if Config.UseMPH then

        return math.floor(
            speed * 2.236936
        )

    end

    return math.floor(
        speed * 3.6
    )

end


--=========================================================
-- RPM
--=========================================================

local function GetRPM(vehicle)

    local rpm =
        GetVehicleCurrentRpm(vehicle)

    return Clamp(
        rpm,
        0.0,
        1.0
    )

end


--=========================================================
-- GEAR
--=========================================================

local function GetGear(vehicle)

    local currentGear =
        GetVehicleCurrentGear(vehicle)

    local speed =
        GetEntitySpeed(vehicle)


    if currentGear == 0 then

        if speed < 0.5 then

            return 'N'

        end

        return 'R'

    end


    return tostring(
        currentGear
    )

end


--=========================================================
-- QB-FUEL
--=========================================================

local function GetFuel(vehicle)

    local fuel = nil


    --=====================================================
    -- QB-FUEL
    --=====================================================

    if GetResourceState('qb-fuel') == 'started' then

        local success,
              result =
            pcall(
                function()

                    return exports['qb-fuel']:GetFuel(
                        vehicle
                    )

                end
            )


        if success
        and result ~= nil then

            fuel =
                tonumber(result)

        end

    end


    --=====================================================
    -- FALLBACK
    --=====================================================

    if fuel == nil then

        fuel =
            GetVehicleFuelLevel(
                vehicle
            )

    end


    return math.floor(
        Clamp(
            fuel,
            0.0,
            100.0
        )
    )

end


--=========================================================
-- ENGINE HEALTH
--=========================================================

local function GetEngineHealth(vehicle)

    local health =
        GetVehicleEngineHealth(vehicle)


    health =
        Clamp(
            health,
            0.0,
            1000.0
        )


    return math.floor(
        health / 10.0
    )

end


--=========================================================
-- LIGHT STATE
--=========================================================

local function GetLightState(vehicle)

    local lightsOn,
          highBeamsOn =
        GetVehicleLightsState(
            vehicle
        )


    return
        lightsOn == 1,
        highBeamsOn == 1

end


--=========================================================
-- ENGINE STATE
--=========================================================

local function GetEngineRunning(vehicle)

    return GetIsVehicleEngineRunning(
        vehicle
    )

end


--=========================================================
-- HANDBRAKE
--=========================================================

local function GetHandbrake(vehicle)

    return GetVehicleHandbrake(
        vehicle
    )

end


--=========================================================
-- ODOMETER
--=========================================================

local function UpdateOdometer(vehicle)

    local coords =
        GetEntityCoords(vehicle)


    if vehicle ~= lastVehicle then

        lastVehicle =
            vehicle

        lastCoords =
            coords

        return

    end


    if lastCoords then

        local distance =
            #(coords - lastCoords)


        if distance < 100.0 then

            currentOdometer =
                currentOdometer +
                distance

        end

    end


    lastCoords =
        coords

end


local function GetDisplayedMileage()

    if Config.UseMPH then

        return currentOdometer /
            1609.344

    end


    return currentOdometer /
        1000.0

end


--=========================================================
-- VEHICLE HUD UPDATE
--=========================================================

local function UpdateVehicleHud(vehicle)

    UpdateOdometer(vehicle)


    local lightsOn,
          highBeams =
        GetLightState(vehicle)


    local fuel =
        GetFuel(vehicle)


    local engineHealth =
        GetEngineHealth(vehicle)


    local rpm =
        GetRPM(vehicle)


    SendNUIMessage({

        action =
            'updateVehicle',

        visible =
            true,


        --=================================================
        -- DRIVING
        --=================================================

        speed =
            GetSpeed(vehicle),

        speedUnit =
            Config.UseMPH
                and 'MPH'
                or 'KM/H',

        rpm =
            rpm,

        gear =
            GetGear(vehicle),


        --=================================================
        -- VEHICLE CONDITION
        --=================================================

        fuel =
            fuel,

        engineHealth =
            engineHealth,

        engineRunning =
            GetEngineRunning(vehicle),


        --=================================================
        -- DRIVER
        --=================================================

        seatbelt =
            seatbelt,

        cruise =
            cruise,

        handbrake =
            GetHandbrake(vehicle),


        --=================================================
        -- LIGHTING
        --=================================================

        lights =
            lightsOn,

        highBeams =
            highBeams,


        --=================================================
        -- OTHER QB-HUD COMPATIBILITY
        --=================================================

        nitrous =
            nitrousLevel,

        nitrousActive =
            nitrousActive,

        harness =
            harnessHealth,


        --=================================================
        -- ODOMETER
        --=================================================

        mileage =
            GetDisplayedMileage(),


        --=================================================
        -- CONFIG VISIBILITY
        --=================================================

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


--=========================================================
-- SEATBELT COMPATIBILITY
--=========================================================

RegisterNetEvent(
    'seatbelt:client:ToggleSeatbelt',
    function()

        seatbelt =
            not seatbelt

    end
)


RegisterNetEvent(
    'seatbelt:client:SetSeatbelt',
    function(state)

        seatbelt =
            state == true

    end
)


RegisterNetEvent(
    'hud:client:SetSeatbelt',
    function(state)

        seatbelt =
            state == true

    end
)


RegisterNetEvent(
    'lemon-hud:client:setSeatbelt',
    function(state)

        seatbelt =
            state == true

    end
)


--=========================================================
-- CRUISE COMPATIBILITY
--=========================================================

RegisterNetEvent(
    'seatbelt:client:ToggleCruise',
    function()

        cruise =
            not cruise

    end
)


RegisterNetEvent(
    'hud:client:SetCruise',
    function(state)

        cruise =
            state == true

    end
)


RegisterNetEvent(
    'lemon-hud:client:setCruise',
    function(state)

        cruise =
            state == true

    end
)


--=========================================================
-- NITROUS COMPATIBILITY
--=========================================================

RegisterNetEvent(
    'hud:client:UpdateNitrous',
    function(level, active)

        nitrousLevel =
            tonumber(level)
            or 0


        nitrousActive =
            active == true

    end
)


--=========================================================
-- HARNESS COMPATIBILITY
--=========================================================

RegisterNetEvent(
    'hud:client:UpdateHarness',
    function(health)

        harnessHealth =
            tonumber(health)
            or 0

    end
)


--=========================================================
-- VEHICLE THREAD
--=========================================================

CreateThread(function()

    while true do

        local ped =
            PlayerPedId()


        if Config.VehicleHUD
        and IsPedInAnyVehicle(
            ped,
            false
        )
        then

            local vehicle =
                GetVehiclePedIsIn(
                    ped,
                    false
                )


            if DoesEntityExist(vehicle) then

                vehicleHudVisible =
                    true


                UpdateVehicleHud(
                    vehicle
                )


                Wait(
                    Config.VehicleUpdateInterval
                    or 75
                )

            else

                Wait(500)

            end

        else

            if vehicleHudVisible then

                vehicleHudVisible =
                    false


                lastVehicle =
                    0


                lastCoords =
                    nil


                SendNUIMessage({

                    action =
                        'updateVehicle',

                    visible =
                        false

                })

            end


            Wait(400)

        end

    end

end)