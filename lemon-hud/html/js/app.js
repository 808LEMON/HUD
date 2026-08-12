//=========================================================
// 808LEMON HUD
// MAIN NUI CONTROLLER
//=========================================================

console.log('[808LEMON HUD] app.js loaded')


//=========================================================
// TOP RIGHT PANEL
//=========================================================

const minimapInfoPanel =
    document.getElementById(
        'minimap-info-panel'
    )


//=========================================================
// PLAYER
//=========================================================

const playerStats =
    document.getElementById(
        'player-stats'
    )

const playerId =
    document.getElementById(
        'player-id'
    )

const playerCash =
    document.getElementById(
        'player-cash'
    )

const playerBank =
    document.getElementById(
        'player-bank'
    )

const playerJob =
    document.getElementById(
        'player-job'
    )

const playerGrade =
    document.getElementById(
        'player-grade'
    )


//=========================================================
// MONEY STATE
//=========================================================

let previousCash =
    null

let previousBank =
    null


//=========================================================
// COMPASS
//=========================================================

const compassWrapper =
    document.getElementById(
        'compass-wrapper'
    )

const compassDirection =
    document.getElementById(
        'compass-direction'
    )

const compassHeading =
    document.getElementById(
        'compass-heading'
    )

const locationDirectionValue =
    document.getElementById(
        'location-direction-value'
    )

const compassLabelLeft =
    document.getElementById(
        'compass-label-left'
    )

const compassLabelRight =
    document.getElementById(
        'compass-label-right'
    )

const streetName =
    document.getElementById(
        'street-name'
    )

const crossingName =
    document.getElementById(
        'crossing-name'
    )

const cityName =
    document.getElementById(
        'city-name'
    )


//=========================================================
// STATUS
//=========================================================

const statusBars =
    document.getElementById(
        'status-bars'
    )

const healthRow =
    document.getElementById(
        'health-row'
    )

const healthFill =
    document.getElementById(
        'health-fill'
    )

const armorRow =
    document.getElementById(
        'armor-row'
    )

const armorFill =
    document.getElementById(
        'armor-fill'
    )

const hungerRow =
    document.getElementById(
        'hunger-row'
    )

const hungerFill =
    document.getElementById(
        'hunger-fill'
    )

const thirstRow =
    document.getElementById(
        'thirst-row'
    )

const thirstFill =
    document.getElementById(
        'thirst-fill'
    )


//=========================================================
// VEHICLE
//=========================================================

const vehicleHud =
    document.getElementById(
        'vehicle-hud'
    )

const speedometerShell =
    document.getElementById(
        'speedometer-shell'
    )

const speed =
    document.getElementById(
        'speed'
    )

const speedUnit =
    document.getElementById(
        'speed-unit'
    )

const gear =
    document.getElementById(
        'gear'
    )

const rpmRing =
    document.getElementById(
        'rpm-ring'
    )

const fuelArc =
    document.getElementById(
        'fuel-arc'
    )

const engineArc =
    document.getElementById(
        'engine-arc'
    )

const fuelMeter =
    document.getElementById(
        'fuel-meter'
    )

const fuelValue =
    document.getElementById(
        'fuel-value'
    )

const engineMeter =
    document.getElementById(
        'engine-meter'
    )

const engineValue =
    document.getElementById(
        'engine-value'
    )

const mileage =
    document.getElementById(
        'mileage'
    )

const headlightIcon =
    document.getElementById(
        'headlight-icon'
    )

const seatbeltIcon =
    document.getElementById(
        'seatbelt-icon'
    )

const cruiseIcon =
    document.getElementById(
        'cruise-icon'
    )


//=========================================================
// VEHICLE SVG STATE
//=========================================================

let rpmPathLength =
    0

let fuelPathLength =
    0

let enginePathLength =
    0

let vehicleWasVisible =
    false


//=========================================================
// MINIMAP
//=========================================================

const minimapBorder =
    document.getElementById(
        'minimap-border'
    )

let lastMinimapGeometry =
    null

const STATUS_MINIMAP_GAP =
    4


//=========================================================
// HELPERS
//=========================================================

function clamp(
    value,
    minimum = 0,
    maximum = 100
) {

    const number =
        Number(
            value
        )


    if (
        !Number.isFinite(
            number
        )
    ) {

        return minimum

    }


    return Math.min(
        maximum,
        Math.max(
            minimum,
            number
        )
    )

}


//=========================================================
// MONEY FORMAT
//=========================================================

function formatMoney(value) {

    const number =
        Number(
            value
        ) || 0


    return '$' +
        Math.floor(
            number
        ).toLocaleString(
            'en-US'
        )

}


//=========================================================
// MONEY ANIMATION
//=========================================================

function restartMoneyAnimation(
    element,
    className
) {

    if (!element) {
        return
    }


    element.classList.remove(
        'money-increase',
        'money-decrease',
        'money-bump'
    )


    void element.offsetWidth


    element.classList.add(
        className,
        'money-bump'
    )


    window.setTimeout(
        () => {

            element.classList.remove(
                'money-increase',
                'money-decrease',
                'money-bump'
            )

        },
        650
    )

}


//=========================================================
// UPDATE MONEY VALUE
//=========================================================

function updateMoneyValue(
    element,
    newValue,
    oldValue
) {

    if (!element) {
        return
    }


    const current =
        Number(
            newValue
        ) || 0


    element.textContent =
        formatMoney(
            current
        )


    // Initial load does not animate

    if (
        oldValue === null ||
        oldValue === undefined
    ) {

        return

    }


    if (
        current > oldValue
    ) {

        restartMoneyAnimation(
            element,
            'money-increase'
        )

    }
    else if (
        current < oldValue
    ) {

        restartMoneyAnimation(
            element,
            'money-decrease'
        )

    }

}


//=========================================================
// STANDARD BAR PERCENTAGE
//=========================================================

function setPercentage(
    element,
    value
) {

    if (!element) {
        return
    }


    const percentage =
        clamp(
            value,
            0,
            100
        )


    element.style.width =
        `${percentage}%`

}


//=========================================================
// INITIALIZE VEHICLE SVG ARCS
//=========================================================

function initializeVehicleArcs() {

    //=====================================================
    // RPM
    //=====================================================

    if (
        rpmRing &&
        typeof rpmRing.getTotalLength ===
            'function'
    ) {

        rpmPathLength =
            rpmRing.getTotalLength()


        rpmRing.style.strokeDasharray =
            `${rpmPathLength}`


        rpmRing.style.strokeDashoffset =
            `${rpmPathLength}`

    }


    //=====================================================
    // FUEL
    //=====================================================

    if (
        fuelArc &&
        typeof fuelArc.getTotalLength ===
            'function'
    ) {

        fuelPathLength =
            fuelArc.getTotalLength()


        fuelArc.style.strokeDasharray =
            `${fuelPathLength}`


        fuelArc.style.strokeDashoffset =
            '0'

    }


    //=====================================================
    // ENGINE
    //=====================================================

    if (
        engineArc &&
        typeof engineArc.getTotalLength ===
            'function'
    ) {

        enginePathLength =
            engineArc.getTotalLength()


        engineArc.style.strokeDasharray =
            `${enginePathLength}`


        engineArc.style.strokeDashoffset =
            '0'

    }

}


//=========================================================
// SVG GAUGE
//=========================================================

function setSvgGauge(
    path,
    pathLength,
    percentage
) {

    if (
        !path ||
        pathLength <= 0
    ) {

        return

    }


    const value =
        clamp(
            percentage,
            0,
            100
        )


    const offset =
        pathLength *
        (
            1 -
            value / 100
        )


    path.style.strokeDashoffset =
        `${offset}`

}


//=========================================================
// PLAYER
//=========================================================

function updatePlayer(data) {

    if (!data) {
        return
    }


    //=====================================================
    // ID
    //=====================================================

    const incomingId =
        data.id !== undefined
            ? data.id
            : data.playerId


    if (
        incomingId !== undefined &&
        playerId
    ) {

        playerId.textContent =
            incomingId

    }


    //=====================================================
    // CASH
    //=====================================================

    if (
        data.cash !== undefined &&
        playerCash
    ) {

        const currentCash =
            Number(
                data.cash
            ) || 0


        updateMoneyValue(
            playerCash,
            currentCash,
            previousCash
        )


        previousCash =
            currentCash

    }


    //=====================================================
    // BANK
    //=====================================================

    if (
        data.bank !== undefined &&
        playerBank
    ) {

        const currentBank =
            Number(
                data.bank
            ) || 0


        updateMoneyValue(
            playerBank,
            currentBank,
            previousBank
        )


        previousBank =
            currentBank

    }


    //=====================================================
    // JOB
    //=====================================================

    if (
        data.job !== undefined &&
        playerJob
    ) {

        playerJob.textContent =
            data.job ||
            'Unemployed'

    }


    //=====================================================
    // GRADE
    //=====================================================

    if (
        data.grade !== undefined &&
        playerGrade
    ) {

        playerGrade.textContent =
            data.grade ||
            ''

    }


    //=====================================================
    // VISIBILITY
    //=====================================================

    if (
        data.visible !== undefined &&
        minimapInfoPanel
    ) {

        minimapInfoPanel.style.display =
            data.visible
                ? 'block'
                : 'none'

    }

}


//=========================================================
// DIRECT MONEY CHANGE
//=========================================================

function moneyChanged(data) {

    if (!data) {
        return
    }


    if (
        data.cash !== undefined &&
        playerCash
    ) {

        const currentCash =
            Number(
                data.cash
            ) || 0


        updateMoneyValue(
            playerCash,
            currentCash,
            previousCash
        )


        previousCash =
            currentCash

    }


    if (
        data.bank !== undefined &&
        playerBank
    ) {

        const currentBank =
            Number(
                data.bank
            ) || 0


        updateMoneyValue(
            playerBank,
            currentBank,
            previousBank
        )


        previousBank =
            currentBank

    }

}


//=========================================================
// STATUS
//=========================================================

function updateStatus(data) {

    if (!data) {
        return
    }


    //=====================================================
    // HEALTH
    //=====================================================

    if (
        data.health !== undefined
    ) {

        setPercentage(
            healthFill,
            data.health
        )

    }


    //=====================================================
    // ARMOR
    //=====================================================

    if (
        data.armor !== undefined
    ) {

        setPercentage(
            armorFill,
            data.armor
        )

    }


    //=====================================================
    // HUNGER
    //=====================================================

    if (
        data.hunger !== undefined
    ) {

        setPercentage(
            hungerFill,
            data.hunger
        )

    }


    //=====================================================
    // THIRST
    //=====================================================

    if (
        data.thirst !== undefined
    ) {

        setPercentage(
            thirstFill,
            data.thirst
        )

    }


    //=====================================================
    // HEALTH VISIBILITY
    //=====================================================

    if (
        healthRow &&
        data.showHealth !== undefined
    ) {

        healthRow.style.display =
            data.showHealth
                ? 'grid'
                : 'none'

    }


    //=====================================================
    // ARMOR VISIBILITY
    //=====================================================

    if (
        armorRow &&
        data.showArmor !== undefined
    ) {

        const currentArmor =
            Number(
                data.armor
            ) || 0


        const shouldShowArmor =
            Boolean(
                data.showArmor
            ) &&
            !(
                Boolean(
                    data.hideArmorWhenEmpty
                ) &&
                currentArmor <= 0
            )


        armorRow.style.display =
            shouldShowArmor
                ? 'grid'
                : 'none'

    }


    //=====================================================
    // HUNGER VISIBILITY
    //=====================================================

    if (
        hungerRow &&
        data.showHunger !== undefined
    ) {

        hungerRow.style.display =
            data.showHunger
                ? 'grid'
                : 'none'

    }


    //=====================================================
    // THIRST VISIBILITY
    //=====================================================

    if (
        thirstRow &&
        data.showThirst !== undefined
    ) {

        thirstRow.style.display =
            data.showThirst
                ? 'grid'
                : 'none'

    }


    requestAnimationFrame(
        anchorStatusToMinimap
    )

}


//=========================================================
// COMPASS
//=========================================================

function updateCompass(data) {

    if (!data) {
        return
    }


    //=====================================================
    // VISIBILITY
    //=====================================================

    if (
        data.visible !== undefined &&
        compassWrapper
    ) {

        compassWrapper.style.display =
            data.visible
                ? 'block'
                : 'none'

    }


    //=====================================================
    // CARDINAL DIRECTION
    //=====================================================

    if (
        data.direction !== undefined
    ) {

        const direction =
            String(
                data.direction
            ).toUpperCase()


        if (
            compassDirection
        ) {

            compassDirection.textContent =
                direction

        }


        if (
            locationDirectionValue
        ) {

            locationDirectionValue.textContent =
                direction

        }

    }


    //=====================================================
    // HEADING
    //=====================================================

    if (
        data.heading !== undefined &&
        compassHeading
    ) {

        let heading =
            Math.round(
                Number(
                    data.heading
                ) || 0
            )


        heading =
            (
                heading % 360 +
                360
            ) % 360


        compassHeading.textContent =
            `${String(
                heading
            ).padStart(
                3,
                '0'
            )}°`

    }


    //=====================================================
    // LEFT
    //=====================================================

    if (
        data.left !== undefined &&
        compassLabelLeft
    ) {

        compassLabelLeft.textContent =
            String(
                data.left
            ).toUpperCase()

    }


    //=====================================================
    // RIGHT
    //=====================================================

    if (
        data.right !== undefined &&
        compassLabelRight
    ) {

        compassLabelRight.textContent =
            String(
                data.right
            ).toUpperCase()

    }


    //=====================================================
    // STREET
    //=====================================================

    if (
        data.street !== undefined &&
        streetName
    ) {

        streetName.textContent =
            data.street ||
            'UNKNOWN ROAD'

    }


    //=====================================================
    // CROSS STREET
    //=====================================================

    if (
        data.crossing !== undefined &&
        crossingName
    ) {

        const crossing =
            data.crossing ||
            ''


        crossingName.textContent =
            crossing


        crossingName.style.display =
            crossing
                ? 'block'
                : 'none'

    }


    //=====================================================
    // CITY
    //=====================================================

    if (
        data.city !== undefined &&
        cityName
    ) {

        cityName.textContent =
            data.city ||
            'SAN ANDREAS'

    }

}


//=========================================================
// VEHICLE
//=========================================================

function updateVehicle(data) {

    if (!data) {
        return
    }


    //=====================================================
    // VISIBILITY
    //=====================================================

    if (
        data.visible !== undefined &&
        vehicleHud
    ) {

        const shouldShow =
            Boolean(
                data.visible
            )


        vehicleHud.style.display =
            shouldShow
                ? 'block'
                : 'none'


        //=================================================
        // ENTRY ANIMATION
        //=================================================

        if (
            shouldShow &&
            !vehicleWasVisible
        ) {

            vehicleWasVisible =
                true


            vehicleHud.classList.remove(
                'vehicle-enter'
            )


            void vehicleHud.offsetWidth


            vehicleHud.classList.add(
                'vehicle-enter'
            )

        }


        if (
            !shouldShow
        ) {

            vehicleWasVisible =
                false


            vehicleHud.classList.remove(
                'vehicle-enter'
            )


            if (
                speedometerShell
            ) {

                speedometerShell.classList.remove(
                    'redline',
                    'low-fuel',
                    'engine-warning'
                )

            }

        }

    }


    if (
        data.visible === false
    ) {

        return

    }


    //=====================================================
    // SPEED
    //=====================================================

    if (
        data.speed !== undefined &&
        speed
    ) {

        const currentSpeed =
            Math.max(
                0,
                Math.round(
                    Number(
                        data.speed
                    ) || 0
                )
            )


        speed.textContent =
            currentSpeed


        /*
            Very small scaling effect at speed.
            Keeps numbers feeling alive without bouncing.
        */

        const speedScale =
            1 +
            Math.min(
                currentSpeed,
                200
            ) / 4000


        speed.style.transform =
            `scale(${speedScale})`

    }


    //=====================================================
    // SPEED UNIT
    //=====================================================

    const unit =
        data.speedUnit !== undefined
            ? data.speedUnit
            : data.unit


    if (
        unit !== undefined &&
        speedUnit
    ) {

        speedUnit.textContent =
            String(
                unit
            ).toUpperCase()

    }


    //=====================================================
    // GEAR
    //=====================================================

    if (
        data.gear !== undefined &&
        gear
    ) {

        gear.textContent =
            String(
                data.gear
            )

    }


    //=====================================================
    // RPM
    //=====================================================

    if (
        data.rpm !== undefined
    ) {

        const rpm =
            clamp(
                Number(
                    data.rpm
                ) * 100,
                0,
                100
            )


        setSvgGauge(
            rpmRing,
            rpmPathLength,
            rpm
        )


        if (
            speedometerShell
        ) {

            speedometerShell
                .classList
                .toggle(
                    'redline',
                    rpm >= 82
                )

        }

    }


    //=====================================================
    // FUEL
    //=====================================================

    if (
        data.fuel !== undefined
    ) {

        const currentFuel =
            Math.round(
                clamp(
                    data.fuel,
                    0,
                    100
                )
            )


        setSvgGauge(
            fuelArc,
            fuelPathLength,
            currentFuel
        )


        if (
            fuelValue
        ) {

            fuelValue.textContent =
                `${currentFuel}%`

        }


        if (
            fuelMeter
        ) {

            fuelMeter
                .classList
                .toggle(
                    'low-fuel',
                    currentFuel <= 15
                )

        }


        if (
            speedometerShell
        ) {

            speedometerShell
                .classList
                .toggle(
                    'low-fuel',
                    currentFuel <= 15
                )

        }

    }


    //=====================================================
    // ENGINE HEALTH
    //=====================================================

    const incomingEngine =
        data.engineHealth !== undefined
            ? data.engineHealth
            : data.engine


    if (
        incomingEngine !== undefined
    ) {

        let currentEngine =
            Number(
                incomingEngine
            ) || 0


        /*
            Accept either:
            0 - 100
            or GTA 0 - 1000.
        */

        if (
            currentEngine > 100
        ) {

            currentEngine =
                currentEngine / 10

        }


        currentEngine =
            Math.round(
                clamp(
                    currentEngine,
                    0,
                    100
                )
            )


        setSvgGauge(
            engineArc,
            enginePathLength,
            currentEngine
        )


        if (
            engineValue
        ) {

            engineValue.textContent =
                `${currentEngine}%`

        }


        if (
            engineMeter
        ) {

            engineMeter
                .classList
                .toggle(
                    'engine-warning',
                    currentEngine <= 35
                )

        }


        if (
            speedometerShell
        ) {

            speedometerShell
                .classList
                .toggle(
                    'engine-warning',
                    currentEngine <= 35
                )

        }

    }


    //=====================================================
    // ODOMETER
    //=====================================================

    if (
        data.mileage !== undefined &&
        mileage
    ) {

        const currentMileage =
            Number(
                data.mileage
            ) || 0


        const currentUnit =
            String(
                unit ||
                'MPH'
            ).toUpperCase()


        const distanceUnit =
            currentUnit.includes(
                'MPH'
            )
                ? 'MI'
                : 'KM'


        mileage.textContent =
            `${currentMileage
                .toFixed(
                    1
                )
                .padStart(
                    6,
                    '0'
                )} ${distanceUnit}`

    }


    //=====================================================
    // HEADLIGHTS
    //=====================================================

    if (
        headlightIcon
    ) {

        const lights =
            data.headlights !== undefined
                ? data.headlights
                : data.lights


        if (
            lights !== undefined
        ) {

            headlightIcon
                .classList
                .toggle(
                    'active',
                    Boolean(
                        lights
                    )
                )

        }

    }


    //=====================================================
    // SEATBELT
    //=====================================================

    if (
        data.seatbelt !== undefined &&
        seatbeltIcon
    ) {

        const enabled =
            Boolean(
                data.seatbelt
            )


        seatbeltIcon
            .classList
            .toggle(
                'active',
                enabled
            )


        seatbeltIcon
            .classList
            .toggle(
                'warning',
                !enabled
            )

    }


    //=====================================================
    // CRUISE CONTROL
    //=====================================================

    if (
        data.cruise !== undefined &&
        cruiseIcon
    ) {

        cruiseIcon
            .classList
            .toggle(
                'active',
                Boolean(
                    data.cruise
                )
            )

    }

}


//=========================================================
// APPLY SAVED POSITION
//=========================================================

function applyHudPosition(
    element,
    position
) {

    if (
        !element ||
        !position
    ) {

        return

    }


    const x =
        Number(
            position.x
        )


    const y =
        Number(
            position.y
        )


    if (
        !Number.isFinite(
            x
        ) ||
        !Number.isFinite(
            y
        )
    ) {

        return

    }


    element.style.left =
        `${x}%`


    element.style.top =
        `${y}%`


    element.style.right =
        'auto'


    element.style.bottom =
        'auto'

}


//=========================================================
// STATUS → MINIMAP ANCHOR
//=========================================================

function anchorStatusToMinimap() {

    if (
        !statusBars ||
        !lastMinimapGeometry
    ) {

        return

    }


    const statusWidth =
        statusBars.offsetWidth


    const statusHeight =
        statusBars.offsetHeight


    if (
        statusWidth <= 0 ||
        statusHeight <= 0
    ) {

        return

    }


    //=====================================================
    // SAME LEFT EDGE AS MINIMAP
    //=====================================================

    let left =
        lastMinimapGeometry.left


    //=====================================================
    // DIRECTLY ABOVE MINIMAP
    //=====================================================

    let top =
        lastMinimapGeometry.top -
        statusHeight -
        STATUS_MINIMAP_GAP


    //=====================================================
    // SCREEN SAFETY
    //=====================================================

    left =
        Math.max(
            0,
            Math.min(
                left,
                window.innerWidth -
                    statusWidth
            )
        )


    top =
        Math.max(
            0,
            top
        )


    //=====================================================
    // APPLY
    //=====================================================

    statusBars.style.left =
        `${Math.round(
            left
        )}px`


    statusBars.style.top =
        `${Math.round(
            top
        )}px`


    statusBars.style.right =
        'auto'


    statusBars.style.bottom =
        'auto'

}


//=========================================================
// APPLY HUD LAYOUT
//=========================================================

function applyHudLayout(layout) {

    if (
        !layout
    ) {

        return

    }


    /*
        Player + compass panel is anchored
        top-right through CSS.

        Status is ultimately positioned by
        real minimap geometry.
    */


    //=====================================================
    // STATUS
    //=====================================================

    if (
        layout.status
    ) {

        applyHudPosition(
            statusBars,
            layout.status
        )

    }


    //=====================================================
    // VEHICLE
    //=====================================================

    if (
        layout.vehicle
    ) {

        applyHudPosition(
            vehicleHud,
            layout.vehicle
        )

    }


    requestAnimationFrame(
        anchorStatusToMinimap
    )

}


//=========================================================
// MINIMAP BORDER
//=========================================================

function setMinimapBorder(data) {

    if (
        !minimapBorder
    ) {

        return

    }


    //=====================================================
    // HIDE
    //=====================================================

    if (
        !data.visible
    ) {

        minimapBorder.style.display =
            'none'


        lastMinimapGeometry =
            null


        return

    }


    //=====================================================
    // GEOMETRY
    //=====================================================

    const left =
        Number(
            data.left
        ) || 0


    const top =
        Number(
            data.top
        ) || 0


    const width =
        Math.max(
            0,
            Number(
                data.width
            ) || 0
        )


    const height =
        Math.max(
            0,
            Number(
                data.height
            ) || 0
        )


    lastMinimapGeometry = {

        left,
        top,
        width,
        height

    }


    //=====================================================
    // APPLY BORDER
    //=====================================================

    minimapBorder.style.left =
        `${left}px`


    minimapBorder.style.top =
        `${top}px`


    minimapBorder.style.width =
        `${width}px`


    minimapBorder.style.height =
        `${height}px`


    minimapBorder.style.display =
        'block'


    //=====================================================
    // ANCHOR STATUS
    //=====================================================

    requestAnimationFrame(
        anchorStatusToMinimap
    )

}


//=========================================================
// MINIMAP BORDER VISIBILITY
//=========================================================

function setMinimapBorderVisible(
    visible
) {

    if (
        !minimapBorder
    ) {

        return

    }


    minimapBorder.style.display =
        visible
            ? 'block'
            : 'none'


    if (
        visible
    ) {

        requestAnimationFrame(
            anchorStatusToMinimap
        )

    }

}


//=========================================================
// HUD VISIBILITY
//=========================================================

function setHudVisible(
    visible
) {

    const hud =
        document.getElementById(
            'hud'
        )


    if (
        !hud
    ) {

        return

    }


    hud.style.display =
        visible
            ? 'block'
            : 'none'

}


//=========================================================
// WINDOW RESIZE
//=========================================================

window.addEventListener(
    'resize',
    () => {

        requestAnimationFrame(
            anchorStatusToMinimap
        )

    }
)


//=========================================================
// NUI MESSAGE HANDLER
//=========================================================

window.addEventListener(
    'message',
    event => {

        const data =
            event.data


        if (
            !data ||
            !data.action
        ) {

            return

        }


        switch (
            data.action
        ) {


            //=================================================
            // PLAYER
            //=================================================

            case 'updatePlayer':

                updatePlayer(
                    data.data ||
                    data
                )

                break


            case 'player':

                updatePlayer(
                    data.data ||
                    data
                )

                break


            //=================================================
            // MONEY
            //=================================================

            case 'moneyChanged':

                moneyChanged(
                    data.data ||
                    data
                )

                break


            case 'updateMoney':

                moneyChanged(
                    data.data ||
                    data
                )

                break


            //=================================================
            // STATUS
            //=================================================

            case 'updateStatus':

                updateStatus(
                    data.data ||
                    data
                )

                break


            case 'status':

                updateStatus(
                    data.data ||
                    data
                )

                break


            //=================================================
            // COMPASS
            //=================================================

            case 'updateCompass':

                updateCompass(
                    data.data ||
                    data
                )

                break


            case 'compass':

                updateCompass(
                    data.data ||
                    data
                )

                break


            //=================================================
            // VEHICLE
            //=================================================

            case 'updateVehicle':

                updateVehicle(
                    data.data ||
                    data
                )

                break


            case 'vehicle':

                updateVehicle(
                    data.data ||
                    data
                )

                break


            case 'showVehicle':

                if (
                    vehicleHud
                ) {

                    vehicleHud.style.display =
                        'block'


                    vehicleWasVisible =
                        true

                }

                break


            case 'hideVehicle':

                if (
                    vehicleHud
                ) {

                    vehicleHud.style.display =
                        'none'


                    vehicleWasVisible =
                        false

                }

                break


            //=================================================
            // HUD
            //=================================================

            case 'showHud':

                setHudVisible(
                    true
                )

                break


            case 'hideHud':

                setHudVisible(
                    false
                )

                break


            case 'setVisible':

                setHudVisible(
                    Boolean(
                        data.visible
                    )
                )

                break


            //=================================================
            // LAYOUT
            //=================================================

            case 'applyHudLayout':

                applyHudLayout(
                    data.layout
                )

                break


            //=================================================
            // MINIMAP
            //=================================================

            case 'setMinimapBorder':

                setMinimapBorder(
                    data
                )

                break


            case 'setMinimapBorderVisible':

                setMinimapBorderVisible(
                    Boolean(
                        data.visible
                    )
                )

                break


            //=================================================
            // QB-HUD COMPATIBILITY
            //=================================================

            case 'setHarness':

                break


            default:

                break

        }

    }
)


//=========================================================
// INITIALIZE VEHICLE SVG PATHS
//=========================================================

if (
    document.readyState ===
    'loading'
) {

    window.addEventListener(
        'DOMContentLoaded',
        () => {

            requestAnimationFrame(
                initializeVehicleArcs
            )

        }
    )

}
else {

    requestAnimationFrame(
        initializeVehicleArcs
    )

}