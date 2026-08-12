const hud =
    document.getElementById('hud')

const playerStats =
    document.getElementById('player-stats')

const playerId =
    document.getElementById('player-id')

const playerCash =
    document.getElementById('player-cash')

const playerBank =
    document.getElementById('player-bank')

const playerJob =
    document.getElementById('player-job')

const playerGrade =
    document.getElementById('player-grade')


const healthRow =
    document.getElementById('health-row')

const armorRow =
    document.getElementById('armor-row')

const hungerRow =
    document.getElementById('hunger-row')

const thirstRow =
    document.getElementById('thirst-row')


const healthFill =
    document.getElementById('health-fill')

const armorFill =
    document.getElementById('armor-fill')

const hungerFill =
    document.getElementById('hunger-fill')

const thirstFill =
    document.getElementById('thirst-fill')


const compassWrapper =
    document.getElementById('compass-wrapper')

const compassDirection =
    document.getElementById('compass-direction')

const compassHeading =
    document.getElementById('compass-heading')

const compassLeft =
    document.getElementById('compass-label-left')

const compassRight =
    document.getElementById('compass-label-right')

const streetName =
    document.getElementById('street-name')

const crossingName =
    document.getElementById('crossing-name')


const vehicleHud =
    document.getElementById('vehicle-hud')

const rpmRing =
    document.getElementById('rpm-ring')

const speed =
    document.getElementById('speed')

const speedUnit =
    document.getElementById('speed-unit')

const gear =
    document.getElementById('gear')

const fuelFill =
    document.getElementById('fuel-fill')

const engineFill =
    document.getElementById('engine-fill')

const mileage =
    document.getElementById('mileage')

const seatbeltIcon =
    document.getElementById('seatbelt-icon')

const headlightIcon =
    document.getElementById('headlight-icon')

const cruiseIcon =
    document.getElementById('cruise-icon')


function clamp(
    value,
    min = 0,
    max = 100
) {

    value =
        Number(value) || 0

    return Math.min(
        Math.max(value, min),
        max
    )

}


function money(value) {

    value =
        Number(value) || 0

    return '$' +
        value.toLocaleString('en-US')

}


function setBar(
    element,
    value
) {

    element.style.width =
        `${clamp(value)}%`

}


function setVerticalBar(
    element,
    value
) {

    element.style.height =
        `${clamp(value)}%`

}


function getCompassNeighbors(heading) {

    const directions = [
        {
            name: 'N',
            degree: 0
        },

        {
            name: 'NE',
            degree: 45
        },

        {
            name: 'E',
            degree: 90
        },

        {
            name: 'SE',
            degree: 135
        },

        {
            name: 'S',
            degree: 180
        },

        {
            name: 'SW',
            degree: 225
        },

        {
            name: 'W',
            degree: 270
        },

        {
            name: 'NW',
            degree: 315
        }
    ]

    let nearestIndex =
        Math.round(
            heading / 45
        ) % 8

    const left =
        directions[
            (nearestIndex + 7) % 8
        ]

    const right =
        directions[
            (nearestIndex + 1) % 8
        ]

    return {
        left:
            left.name,

        right:
            right.name
    }

}


function updateRpmRing(value) {

    const normalized =
        clamp(
            Number(value) * 100,
            0,
            100
        )

    /*
        Main visible sweep is around 75%
        of the circle.

        593 is the visible arc length.
    */

    const progress =
        593 *
        (normalized / 100)

    rpmRing.style.strokeDasharray =
        `${progress} ${792 - progress}`

}


window.addEventListener(
    'message',
    function(event) {

        const data =
            event.data

        if (
            !data ||
            !data.action
        ) {
            return
        }


        switch (data.action) {


            /* ==========================================
               GLOBAL
            ========================================== */

            case 'setVisible':

                hud.style.display =
                    data.visible
                        ? 'block'
                        : 'none'

                break


            /* ==========================================
               PLAYER
            ========================================== */

            case 'updatePlayer':

                playerStats.style.display =
                    data.visible
                        ? 'block'
                        : 'none'

                playerId.textContent =
                    data.playerId ?? 0

                playerCash.textContent =
                    money(data.cash)

                playerBank.textContent =
                    money(data.bank)

                playerJob.textContent =
                    data.job ||
                    'Unemployed'

                playerGrade.textContent =
                    data.grade || ''


                setBar(
                    healthFill,
                    data.health
                )

                setBar(
                    armorFill,
                    data.armor
                )

                setBar(
                    hungerFill,
                    data.hunger
                )

                setBar(
                    thirstFill,
                    data.thirst
                )


                healthRow.style.display =
                    data.showHealth
                        ? 'flex'
                        : 'none'


                armorRow.style.display =
                    data.showArmor
                        ? 'flex'
                        : 'none'


                hungerRow.style.display =
                    data.showHunger
                        ? 'flex'
                        : 'none'


                thirstRow.style.display =
                    data.showThirst
                        ? 'flex'
                        : 'none'


                if (
                    data.hideArmorWhenEmpty &&
                    Number(data.armor) <= 0
                ) {

                    armorRow.style.display =
                        'none'

                }

                break


            /* ==========================================
               COMPASS
            ========================================== */

            case 'updateCompass':

                compassWrapper.style.display =
                    data.visible
                        ? 'block'
                        : 'none'

                if (!data.visible)
                    break


                const heading =
                    Number(
                        data.heading
                    ) || 0


                compassDirection.textContent =
                    data.direction || 'N'


                compassHeading.textContent =
                    `${Math.round(heading)
                        .toString()
                        .padStart(3, '0')}°`


                const neighbors =
                    getCompassNeighbors(
                        heading
                    )


                compassLeft.textContent =
                    neighbors.left


                compassRight.textContent =
                    neighbors.right


                if (
                    data.showStreetNames
                ) {

                    streetName.style.display =
                        'block'

                    streetName.textContent =
                        (
                            data.street ||
                            'UNKNOWN ROAD'
                        ).toUpperCase()


                    if (
                        data.crossing &&
                        data.crossing.length > 0
                    ) {

                        crossingName.style.display =
                            'block'

                        crossingName.textContent =
                            `/ ${data.crossing.toUpperCase()}`

                    } else {

                        crossingName.style.display =
                            'none'

                    }

                } else {

                    streetName.style.display =
                        'none'

                    crossingName.style.display =
                        'none'

                }

                break


            /* ==========================================
               VEHICLE
            ========================================== */

            case 'updateVehicle':

                vehicleHud.style.display =
                    data.visible
                        ? 'block'
                        : 'none'


                if (!data.visible)
                    break


                speed.textContent =
                    data.speed ?? 0


                speedUnit.textContent =
                    data.speedUnit ||
                    'MPH'


                gear.textContent =
                    data.gear ||
                    'N'


                updateRpmRing(
                    data.rpm
                )


                setVerticalBar(
                    fuelFill,
                    data.fuel
                )


                setVerticalBar(
                    engineFill,
                    data.engineHealth
                )


                const mileageValue =
                    Number(
                        data.mileage
                    ) || 0


                mileage.textContent =
                    `${mileageValue
                        .toFixed(1)
                        .padStart(6, '0')} ${
                        data.speedUnit === 'MPH'
                            ? 'MI'
                            : 'KM'
                    }`


                seatbeltIcon.classList.toggle(
                    'active',
                    !!data.seatbelt
                )


                seatbeltIcon.classList.toggle(
                    'warning',
                    !data.seatbelt
                )


                headlightIcon.classList.toggle(
                    'active',
                    !!data.lights
                )


                cruiseIcon.classList.toggle(
                    'active',
                    !!data.cruise
                )


                break


            case 'setHarness':

                break

        }

    }
)