--=========================================================
-- 808LEMON HUD
-- COMPASS / STREET / CITY
--=========================================================


--=========================================================
-- NORMALIZE HEADING
--=========================================================

local function NormalizeHeading(heading)

    heading =
        heading % 360.0

    if heading < 0 then
        heading =
            heading + 360.0
    end

    return heading

end


--=========================================================
-- DIRECTION TABLE
--=========================================================

local directions = {
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
-- GET DIRECTION INDEX
--=========================================================

local function GetDirectionIndex(heading)

    return
        math.floor(
            (
                heading + 22.5
            ) / 45.0
        ) % 8 + 1

end


--=========================================================
-- GET CURRENT DIRECTION
--=========================================================

local function GetDirection(heading)

    return directions[
        GetDirectionIndex(
            heading
        )
    ]

end


--=========================================================
-- GET NEIGHBOR DIRECTIONS
--=========================================================

local function GetNeighborDirections(heading)

    local index =
        GetDirectionIndex(
            heading
        )


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
        directions[leftIndex],
        directions[rightIndex]

end


--=========================================================
-- LOS SANTOS ZONES
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


--=========================================================
-- BLAINE COUNTY ZONES
--=========================================================

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


--=========================================================
-- CITY / COUNTY
--=========================================================

local function GetCityName(coords)

    local zone =
        GetNameOfZone(
            coords.x,
            coords.y,
            coords.z
        )


    if not zone
    or zone == ''
    then

        return 'SAN ANDREAS'

    end


    if LosSantosZones[zone] then

        return 'LOS SANTOS'

    end


    if BlaineCountyZones[zone] then

        return 'BLAINE COUNTY'

    end


    return 'SAN ANDREAS'

end


--=========================================================
-- COMPASS THREAD
--=========================================================

CreateThread(function()

    while true do


        --=================================================
        -- COMPASS DISABLED
        --=================================================

        if not Config.ShowCompass then

            SendNUIMessage({

                action =
                    'updateCompass',

                visible =
                    false

            })


            Wait(1000)


        else


            --=================================================
            -- PED / POSITION
            --=================================================

            local ped =
                PlayerPedId()


            local coords =
                GetEntityCoords(
                    ped
                )


            --=================================================
            -- CAMERA HEADING
            --=================================================

            local camRot =
                GetGameplayCamRot(2)


            local heading =
                NormalizeHeading(
                    camRot.z
                )


            --=================================================
            -- DIRECTIONS
            --=================================================

            local direction =
                GetDirection(
                    heading
                )


            local leftDirection,
                  rightDirection =
                GetNeighborDirections(
                    heading
                )


            --=================================================
            -- STREET HASHES
            --=================================================

            local streetHash,
                  crossingHash =
                GetStreetNameAtCoord(
                    coords.x,
                    coords.y,
                    coords.z
                )


            --=================================================
            -- STREET
            --=================================================

            local street = ''


            if streetHash
            and streetHash ~= 0
            then

                street =
                    GetStreetNameFromHashKey(
                        streetHash
                    )

            end


            if not street
            or street == ''
            then

                street =
                    'UNKNOWN ROAD'

            end


            --=================================================
            -- CROSS STREET
            --=================================================

            local crossing = ''


            if crossingHash
            and crossingHash ~= 0
            then

                crossing =
                    GetStreetNameFromHashKey(
                        crossingHash
                    )

            end


            --=================================================
            -- CITY
            --=================================================

            local city =
                GetCityName(
                    coords
                )


            --=================================================
            -- NUI
            --=================================================

            SendNUIMessage({

                action =
                    'updateCompass',

                visible =
                    true,

                heading =
                    math.floor(
                        heading + 0.5
                    ),

                direction =
                    direction,

                left =
                    leftDirection,

                right =
                    rightDirection,

                street =
                    street,

                crossing =
                    crossing,

                city =
                    city,

                showStreetNames =
                    Config.ShowStreetNames

            })


            Wait(
                Config.CompassUpdateInterval
                or 75
            )

        end

    end

end)