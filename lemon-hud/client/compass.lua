--=========================================================
-- 808LEMON HUD
-- COMPASS / STREET / CITY
--=========================================================

local Directions = {
    'N',
    'NE',
    'E',
    'SE',
    'S',
    'SW',
    'W',
    'NW'
}

--=========================================================
-- NORMALIZE HEADING
--=========================================================

local function NormalizeHeading(heading)

    heading = heading % 360.0

    if heading < 0.0 then
        heading = heading + 360.0
    end

    return heading
end

--=========================================================
-- GET DIRECTION INDEX
--=========================================================

local function GetDirectionIndex(heading)

    return (
        math.floor(
            (heading + 22.5) / 45.0
        ) % 8
    ) + 1
end

--=========================================================
-- GET DIRECTIONS
--=========================================================

local function GetDirections(heading)

    local index =
        GetDirectionIndex(heading)

    local leftIndex =
        index - 1

    if leftIndex < 1 then
        leftIndex = 8
    end

    local rightIndex =
        index + 1

    if rightIndex > 8 then
        rightIndex = 1
    end

    return
        Directions[index],
        Directions[leftIndex],
        Directions[rightIndex]
end

--=========================================================
-- CITY / COUNTY DETECTION
--=========================================================

local LosSantosZones = {

    AIRP = true,
    ALTA = true,
    BANNING = true,
    BEACH = true,
    BURTON = true,
    CHAMH = true,
    CYPRE = true,
    DAVIS = true,
    DELBE = true,
    DELPE = true,
    DELSOL = true,
    DOWNT = true,
    DTVINE = true,
    EAST_V = true,
    EBURO = true,
    ECLIPS = true,
    ELGORL = true,
    ELYSIAN = true,
    GOLF = true,
    HAWICK = true,
    HORS = true,
    KOREAT = true,
    LACT = true,
    LDAM = true,
    LEGSQU = true,
    LMESA = true,
    LOSPUER = true,
    MIRR = true,
    MORN = true,
    MOVIE = true,
    MURRI = true,
    PBOX = true,
    RANCHO = true,
    RGLEN = true,
    RICHM = true,
    ROCKF = true,
    SKID = true,
    STAD = true,
    STRAW = true,
    TERMINA = true,
    TEXTI = true,
    VCANA = true,
    VESP = true,
    VINE = true,
    WVINE = true

}

local BlaineCountyZones = {

    ALAMO = true,
    BRADP = true,
    CALAFB = true,
    CANNY = true,
    CCREAK = true,
    CHIL = true,
    DESRT = true,
    GALFISH = true,
    GRAPES = true,
    GREATC = true,
    HARMO = true,
    HUMLAB = true,
    JAIL = true,
    MTCHIL = true,
    MTGORDO = true,
    MTJOSE = true,
    PALCOV = true,
    PALETO = true,
    PALFOR = true,
    PALHIGH = true,
    PROCOB = true,
    RTRAK = true,
    SANCHIA = true,
    SANDY = true,
    SLAB = true,
    TATAMO = true,
    ZANCUDO = true,
    ZQ_UAR = true

}

local function GetCityName(coords)

    local zone =
        GetNameOfZone(
            coords.x,
            coords.y,
            coords.z
        )

    if LosSantosZones[zone] then
        return 'LOS SANTOS'
    end

    if BlaineCountyZones[zone] then
        return 'BLAINE COUNTY'
    end

    return 'SAN ANDREAS'
end

--=========================================================
-- MAIN COMPASS THREAD
--=========================================================

CreateThread(function()

    while true do

        if not Config.ShowCompass then

            SendNUIMessage({
                action = 'updateCompass',
                visible = false
            })

            Wait(1000)

        else

            local ped =
                PlayerPedId()

            local coords =
                GetEntityCoords(ped)

            local rotation =
                GetGameplayCamRot(2)

            local heading =
                NormalizeHeading(
                    rotation.z
                )

            local direction,
                  leftDirection,
                  rightDirection =
                GetDirections(heading)

            local streetHash,
                  crossingHash =
                GetStreetNameAtCoord(
                    coords.x,
                    coords.y,
                    coords.z
                )

            local street =
                'UNKNOWN ROAD'

            if streetHash
            and streetHash ~= 0
            then

                local result =
                    GetStreetNameFromHashKey(
                        streetHash
                    )

                if result
                and result ~= ''
                then
                    street = result
                end

            end

            local crossing = ''

            if crossingHash
            and crossingHash ~= 0
            then

                crossing =
                    GetStreetNameFromHashKey(
                        crossingHash
                    ) or ''

            end

            local city =
                GetCityName(coords)

            SendNUIMessage({

                action = 'updateCompass',

                visible = true,

                direction = direction,

                left = leftDirection,

                right = rightDirection,

                heading =
                    math.floor(
                        heading + 0.5
                    ),

                street = street,

                crossing = crossing,

                city = city

            })

            Wait(
                Config.CompassUpdateInterval
                or 75
            )

        end

    end

end)