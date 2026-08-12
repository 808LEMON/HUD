local function NormalizeHeading(heading)

    heading = heading % 360.0

    if heading < 0 then
        heading = heading + 360.0
    end

    return heading

end

local function GetDirection(heading)

    if heading >= 337.5 or heading < 22.5 then
        return 'N'
    elseif heading < 67.5 then
        return 'NE'
    elseif heading < 112.5 then
        return 'E'
    elseif heading < 157.5 then
        return 'SE'
    elseif heading < 202.5 then
        return 'S'
    elseif heading < 247.5 then
        return 'SW'
    elseif heading < 292.5 then
        return 'W'
    elseif heading < 337.5 then
        return 'NW'
    end

    return 'N'

end

CreateThread(function()

    while true do

        if not Config.ShowCompass then

            SendNUIMessage({
                action = 'updateCompass',
                visible = false
            })

            Wait(1000)

        else

            local ped = PlayerPedId()
            local coords = GetEntityCoords(ped)

            local camRot = GetGameplayCamRot(2)
            local heading = NormalizeHeading(camRot.z)

            local streetHash, crossingHash =
                GetStreetNameAtCoord(
                    coords.x,
                    coords.y,
                    coords.z
                )

            local street = ''

            if streetHash ~= 0 then
                street =
                    GetStreetNameFromHashKey(streetHash)
            end

            local crossing = ''

            if crossingHash ~= 0 then
                crossing =
                    GetStreetNameFromHashKey(crossingHash)
            end

            SendNUIMessage({
                action = 'updateCompass',

                visible = true,

                heading = math.floor(heading + 0.5),

                direction =
                    GetDirection(heading),

                street = street,

                crossing = crossing,

                showStreetNames =
                    Config.ShowStreetNames
            })

            Wait(Config.CompassUpdateInterval)

        end

    end

end)