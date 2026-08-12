--=========================================================
-- 808LEMON HUD
-- VEHICLE HUD
-- QBCORE / QB-FUEL
-- GEAR SHIFT + HIGH SPEED EFFECTS
--=========================================================


--=========================================================
-- VEHICLE HUD STATE
--=========================================================

local vehicleHudVisible = false

local seatbelt = false
local cruise = false

local nitrousLevel = 0
local nitrousActive = false

local harnessHealth = 0


--=========================================================
-- ODOMETER STATE
--=========================================================

local currentOdometer = 0.0

local lastCoords = nil
local lastVehicle = 0


--=========================================================
-- GEAR EFFECT STATE
--=========================================================

local lastGear = 0

local highSpeedEffectActive = false

local currentEffectVehicle = 0


--=========================================================
-- EFFECT SETTINGS
--=========================================================

local GearEffects = {

    -- 4TH GEAR SHIFT PUNCH

    FourthGearShake = 0.35,


    -- 5TH GEAR SHIFT PUNCH

    FifthGearShake = 0.60,


    -- CONTINUOUS HIGH SPEED SHAKE

    HighSpeedShake = 0.30,


    -- START EFFECT

    HighSpeedMinimumMPH = 110.0,

    HighSpeedMinimumKMH = 175.0,


    -- SCREEN EFFECT

    ScreenEffect = 'RaceTurbo',


    -- TIMECYCLE

    TimecycleModifier = 'MP_corona_switch',

    TimecycleStrength = 0.30,


    -- DEBUG GEAR CHANGES

    Debug = false

}


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
-- SPEED FLOAT
--=========================================================

local function GetSpeedFloat(vehicle)

    local speed =
        GetEntitySpeed(vehicle)


    if Config.UseMPH then

        return speed * 2.236936

    end


    return speed * 3.6

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
-- RAW GEAR
--=========================================================

local function GetRawGear(vehicle)

    return tonumber(
        GetVehicleCurrentGear(vehicle)
    ) or 0

end


--=========================================================
-- DISPLAY GEAR
--=========================================================

local function GetGear(vehicle)

    local currentGear =
        GetRawGear(vehicle)


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
    -- QB-FUEL EXPORT
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
        and result ~= nil
        then

            fuel =
                tonumber(
                    result
                )

        end

    end


    --=====================================================
    -- NATIVE FALLBACK
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
        GetVehicleEngineHealth(
            vehicle
        )


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
        GetEntityCoords(
            vehicle
        )


    --=====================================================
    -- NEW VEHICLE
    --=====================================================

    if vehicle ~= lastVehicle then

        lastVehicle =
            vehicle


        lastCoords =
            coords


        return

    end


    --=====================================================
    -- DISTANCE
    --=====================================================

    if lastCoords then

        local distance =
            #(coords - lastCoords)


        /*
            Ignore huge coordinate jumps.

            Prevents teleports / vehicle changes from
            adding fake mileage.
        */

        if distance < 100.0 then

            currentOdometer =
                currentOdometer +
                distance

        end

    end


    lastCoords =
        coords

end


--=========================================================
-- DISPLAYED MILEAGE
--=========================================================

local function GetDisplayedMileage()

    if Config.UseMPH then

        return currentOdometer /
            1609.344

    end


    return currentOdometer /
        1000.0

end


--=========================================================
-- FOURTH / FIFTH GEAR SHIFT PUNCH
--=========================================================

local function DoGearShiftPunch(gear)

    --=====================================================
    -- FOURTH
    --=====================================================

    if gear == 4 then

        ShakeGameplayCam(
            'JOLT_SHAKE',
            GearEffects.FourthGearShake
        )


        /*
            Briefly emphasize the shake.
        */

        SetGameplayCamShakeAmplitude(
            GearEffects.FourthGearShake
        )


    --=====================================================
    -- FIFTH+
    --=====================================================

    elseif gear >= 5 then

        ShakeGameplayCam(
            'JOLT_SHAKE',
            GearEffects.FifthGearShake
        )


        SetGameplayCamShakeAmplitude(
            GearEffects.FifthGearShake
        )

    end

end


--=========================================================
-- START HIGH SPEED EFFECT
--=========================================================

local function StartHighSpeedEffect(vehicle)

    if highSpeedEffectActive
    and currentEffectVehicle == vehicle
    then

        return

    end


    highSpeedEffectActive =
        true


    currentEffectVehicle =
        vehicle


    --=====================================================
    -- POST FX
    --=====================================================

    AnimpostfxPlay(
        GearEffects.ScreenEffect,
        0,
        true
    )


    --=====================================================
    -- TIMECYCLE
    --=====================================================

    SetTimecycleModifier(
        GearEffects.TimecycleModifier
    )


    SetTimecycleModifierStrength(
        GearEffects.TimecycleStrength
    )


    --=====================================================
    -- CAMERA VIBRATION
    --=====================================================

    ShakeGameplayCam(
        'VIBRATE_SHAKE',
        GearEffects.HighSpeedShake
    )


    SetGameplayCamShakeAmplitude(
        GearEffects.HighSpeedShake
    )

end


--=========================================================
-- STOP HIGH SPEED EFFECT
--=========================================================

local function StopHighSpeedEffect()

    if not highSpeedEffectActive then

        return

    end


    highSpeedEffectActive =
        false


    currentEffectVehicle =
        0


    --=====================================================
    -- SCREEN EFFECT
    --=====================================================

    AnimpostfxStop(
        GearEffects.ScreenEffect
    )


    --=====================================================
    -- CAMERA
    --=====================================================

    StopGameplayCamShaking(
        true
    )


    --=====================================================
    -- TIMECYCLE
    --=====================================================

    ClearTimecycleModifier()

end


--=========================================================
-- UPDATE GEAR EFFECTS
--=========================================================

local function UpdateGearEffects(vehicle)

    local currentGear =
        GetRawGear(
            vehicle
        )


    local currentSpeed =
        GetSpeedFloat(
            vehicle
        )


    --=====================================================
    -- DEBUG
    --=====================================================

    if GearEffects.Debug
    and currentGear ~= lastGear
    then

        print(
            '[808LEMON HUD] Gear:',
            lastGear,
            '->',
            currentGear,
            '| Speed:',
            math.floor(
                currentSpeed
            )
        )

    end


    --=====================================================
    -- GEAR CHANGED
    --=====================================================

    if currentGear ~= lastGear then


        --=================================================
        -- ENTERING FOURTH
        --=================================================

        if currentGear == 4 then

            DoGearShiftPunch(
                4
            )


        --=================================================
        -- ENTERING FIFTH OR HIGHER
        --=================================================

        elseif currentGear >= 5 then

            DoGearShiftPunch(
                currentGear
            )

        end


        lastGear =
            currentGear

    end


    --=====================================================
    -- SPEED REQUIRED FOR HIGH SPEED FX
    --=====================================================

    local minimumSpeed =
        Config.UseMPH
        and GearEffects.HighSpeedMinimumMPH
        or GearEffects.HighSpeedMinimumKMH


    --=====================================================
    -- HIGH SPEED MODE
    --=====================================================

    if currentGear >= 5
    and currentSpeed >= minimumSpeed
    then

        StartHighSpeedEffect(
            vehicle
        )

    else

        StopHighSpeedEffect()

    end

end


--=========================================================
-- VEHICLE HUD UPDATE
--=========================================================

local function UpdateVehicleHud(vehicle)

    UpdateOdometer(
        vehicle
    )


    local lightsOn,
          highBeams =
        GetLightState(
            vehicle
        )


    local fuel =
        GetFuel(
            vehicle
        )


    local engineHealth =
        GetEngineHealth(
            vehicle
        )


    local rpm =
        GetRPM(
            vehicle
        )


    SendNUIMessage({

        action =
            'updateVehicle',

        visible =
            true,


        --=================================================
        -- DRIVING
        --=================================================

        speed =
            GetSpeed(
                vehicle
            ),

        speedUnit =
            Config.UseMPH
                and 'MPH'
                or 'KM/H',

        rpm =
            rpm,

        gear =
            GetGear(
                vehicle
            ),


        --=================================================
        -- VEHICLE CONDITION
        --=================================================

        fuel =
            fuel,

        engineHealth =
            engineHealth,

        engineRunning =
            GetEngineRunning(
                vehicle
            ),


        --=================================================
        -- DRIVER
        --=================================================

        seatbelt =
            seatbelt,

        cruise =
            cruise,

        handbrake =
            GetHandbrake(
                vehicle
            ),


        --=================================================
        -- LIGHTING
        --=================================================

        lights =
            lightsOn,

        highBeams =
            highBeams,


        --=================================================
        -- QB-HUD COMPATIBILITY
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
        -- CONFIG
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
-- SEATBELT
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
-- CRUISE
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
-- NITROUS
--=========================================================

RegisterNetEvent(
    'hud:client:UpdateNitrous',
    function(level, active)

        nitrousLevel =
            tonumber(
                level
            )
            or 0


        nitrousActive =
            active == true

    end
)


--=========================================================
-- HARNESS
--=========================================================

RegisterNetEvent(
    'hud:client:UpdateHarness',
    function(health)

        harnessHealth =
            tonumber(
                health
            )
            or 0

    end
)


--=========================================================
-- MAIN VEHICLE THREAD
--=========================================================

CreateThread(function()

    while true do

        local ped =
            PlayerPedId()


        --=================================================
        -- PLAYER IN VEHICLE
        --=================================================

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


            if DoesEntityExist(
                vehicle
            )
            then


                --=========================================
                -- VEHICLE CHANGED
                --=========================================

                if lastVehicle ~= 0
                and lastVehicle ~= vehicle
                then

                    lastGear =
                        0


                    StopHighSpeedEffect()

                end


                --=========================================
                -- HUD
                --=========================================

                vehicleHudVisible =
                    true


                --=========================================
                -- EFFECTS
                --=========================================

                UpdateGearEffects(
                    vehicle
                )


                --=========================================
                -- HUD DATA
                --=========================================

                UpdateVehicleHud(
                    vehicle
                )


                Wait(
                    Config.VehicleUpdateInterval
                    or 75
                )

            else


                StopHighSpeedEffect()


                lastGear =
                    0


                Wait(
                    500
                )

            end


        --=================================================
        -- PLAYER OUTSIDE VEHICLE
        --=================================================

        else


            --=================================================
            -- STOP EFFECTS
            --=================================================

            StopHighSpeedEffect()


            lastGear =
                0


            --=================================================
            -- HIDE HUD
            --=================================================

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


            Wait(
                400
            )

        end

    end

end)


--=========================================================
-- RESOURCE STOP CLEANUP
--=========================================================

AddEventHandler(
    'onResourceStop',
    function(resourceName)

        if resourceName ~= GetCurrentResourceName() then

            return

        end


        StopHighSpeedEffect()

    end
)