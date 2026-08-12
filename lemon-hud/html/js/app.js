//=========================================================
// 808LEMON HUD
// MAIN NUI CONTROLLER
//=========================================================

console.log('[808LEMON HUD] app.js loaded')

//=========================================================
// DOM REFERENCES
//=========================================================

// PLAYER
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


// COMPASS
const compassWrapper =
    document.getElementById('compass-wrapper')

const compassDirection =
    document.getElementById('compass-direction')

const compassHeading =
    document.getElementById('compass-heading')

const compassLabelLeft =
    document.getElementById('compass-label-left')

const compassLabelRight =
    document.getElementById('compass-label-right')

const streetName =
    document.getElementById('street-name')

const crossingName =
    document.getElementById('crossing-name')


// STATUS
const statusBars =
    document.getElementById('status-bars')

const healthRow =
    document.getElementById('health-row')

const healthFill =
    document.getElementById('health-fill')

const armorRow =
    document.getElementById('armor-row')

const armorFill =
    document.getElementById('armor-fill')

const hungerRow =
    document.getElementById('hunger-row')

const hungerFill =
    document.getElementById('hunger-fill')

const thirstRow =
    document.getElementById('thirst-row')

const thirstFill =
    document.getElementById('thirst-fill')


// VEHICLE
const vehicleHud =
    document.getElementById('vehicle-hud')

const speed =
    document.getElementById('speed')

const speedUnit =
    document.getElementById('speed-unit')

const gear =
    document.getElementById('gear')

const rpmRing =
    document.getElementById('rpm-ring')

const fuelFill =
    document.getElementById('fuel-fill')

const engineFill =
    document.getElementById('engine-fill')

const mileage =
    document.getElementById('mileage')

const headlightIcon =
    document.getElementById('headlight-icon')

const seatbeltIcon =
    document.getElementById('seatbelt-icon')

const cruiseIcon =
    document.getElementById('cruise-icon')


// MINIMAP BORDER
const minimapBorder =
    document.getElementById('minimap-border')


//=========================================================
// HELPERS
//=========================================================

function clamp(value, minimum = 0, maximum = 100) {

    const number =
        Number(value)

    if (!Number.isFinite(number)) {
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
        Number(value) || 0

    return '$' +
        Math.floor(number)
            .toLocaleString('en-US')
}


//=========================================================
// PERCENTAGE
//=========================================================

function setPercentage(element, value) {

    if (!element) {
        return
    }

    const percentage =
        clamp(value)

    element.style.width =
        `${percentage}%`
}


//=========================================================
// PLAYER DATA
//=========================================================

function updatePlayer(data) {

    if (!data) {
        return
    }

    if (
        data.id !== undefined &&
        playerId
    ) {
        playerId.textContent =
            data.id
    }

    if (
        data.cash !== undefined &&
        playerCash
    ) {
        playerCash.textContent =
            formatMoney(data.cash)
    }

    if (
        data.bank !== undefined &&
        playerBank
    ) {
        playerBank.textContent =
            formatMoney(data.bank)
    }

    if (
        data.job !== undefined &&
        playerJob
    ) {
        playerJob.textContent =
            data.job || 'Unemployed'
    }

    if (
        data.grade !== undefined &&
        playerGrade
    ) {

        playerGrade.textContent =
            data.grade || ''

    }

}


//=========================================================
// STATUS
//=========================================================

function updateStatus(data) {

    if (!data) {
        return
    }

    if (data.health !== undefined) {

        setPercentage(
            healthFill,
            data.health
        )

    }

    if (data.armor !== undefined) {

        setPercentage(
            armorFill,
            data.armor
        )

    }

    if (data.hunger !== undefined) {

        setPercentage(
            hungerFill,
            data.hunger
        )

    }

    if (data.thirst !== undefined) {

        setPercentage(
            thirstFill,
            data.thirst
        )

    }

    if (
        armorRow &&
        data.showArmor !== undefined
    ) {

        armorRow.style.display =
            data.showArmor
                ? 'flex'
                : 'none'

    }

}


//=========================================================
// COMPASS
//=========================================================

function updateCompass(data) {

    if (!data) {
        return
    }

    if (
        data.direction !== undefined &&
        compassDirection
    ) {

        compassDirection.textContent =
            data.direction

    }

    if (
        data.heading !== undefined &&
        compassHeading
    ) {

        const heading =
            Math.round(
                Number(data.heading) || 0
            )

        compassHeading.textContent =
            `${String(heading).padStart(3, '0')}°`

    }

    if (
        data.left !== undefined &&
        compassLabelLeft
    ) {

        compassLabelLeft.textContent =
            data.left

    }

    if (
        data.right !== undefined &&
        compassLabelRight
    ) {

        compassLabelRight.textContent =
            data.right

    }

    if (
        data.street !== undefined &&
        streetName
    ) {

        streetName.textContent =
            data.street || 'UNKNOWN ROAD'

    }

    if (
        data.crossing !== undefined &&
        crossingName
    ) {

        crossingName.textContent =
            data.crossing || ''

        crossingName.style.display =
            data.crossing
                ? 'block'
                : 'none'

    }

}


//=========================================================
// VEHICLE
//=========================================================

function updateVehicle(data) {

    if (!data) {
        return
    }

    if (
        data.visible !== undefined &&
        vehicleHud
    ) {

        vehicleHud.style.display =
            data.visible
                ? 'block'
                : 'none'

    }

    if (!data.visible) {
        return
    }

    if (
        data.speed !== undefined &&
        speed
    ) {

        speed.textContent =
            Math.round(
                Number(data.speed) || 0
            )

    }

    if (
        data.unit !== undefined &&
        speedUnit
    ) {

        speedUnit.textContent =
            String(data.unit).toUpperCase()

    }

    if (
        data.gear !== undefined &&
        gear
    ) {

        const gearValue =
            Number(data.gear)

        gear.textContent =
            gearValue === 0
                ? 'N'
                : String(data.gear)

    }

    if (
        data.rpm !== undefined &&
        rpmRing
    ) {

        const rpm =
            clamp(
                Number(data.rpm) * 100
            )

        /*
            Circle radius = 126
            Circumference ≈ 791.68
        */

        const circumference =
            791.68

        const offset =
            circumference -
            (
                rpm / 100
            ) *
            circumference

        rpmRing.style.strokeDasharray =
            `${circumference}`

        rpmRing.style.strokeDashoffset =
            `${offset}`

    }

    if (
        data.fuel !== undefined &&
        fuelFill
    ) {

        fuelFill.style.height =
            `${clamp(data.fuel)}%`

    }

    if (
        data.engine !== undefined &&
        engineFill
    ) {

        let engine =
            Number(data.engine) || 0

        if (engine > 100) {
            engine /= 10
        }

        engineFill.style.height =
            `${clamp(engine)}%`

    }

    if (
        data.mileage !== undefined &&
        mileage
    ) {

        const miles =
            Number(data.mileage) || 0

        mileage.textContent =
            `${miles.toFixed(1)} MI`

    }

    if (
        data.headlights !== undefined &&
        headlightIcon
    ) {

        headlightIcon.classList.toggle(
            'active',
            Boolean(data.headlights)
        )

    }

    if (
        data.seatbelt !== undefined &&
        seatbeltIcon
    ) {

        seatbeltIcon.classList.toggle(
            'active',
            Boolean(data.seatbelt)
        )

        seatbeltIcon.classList.toggle(
            'warning',
            !Boolean(data.seatbelt)
        )

    }

    if (
        data.cruise !== undefined &&
        cruiseIcon
    ) {

        cruiseIcon.classList.toggle(
            'active',
            Boolean(data.cruise)
        )

    }

}


//=========================================================
// APPLY SAVED HUD POSITION
//=========================================================

function applyHudPosition(element, position) {

    if (
        !element ||
        !position
    ) {
        return
    }

    const x =
        Number(position.x)

    const y =
        Number(position.y)

    if (
        !Number.isFinite(x) ||
        !Number.isFinite(y)
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
// APPLY HUD LAYOUT
//=========================================================

function applyHudLayout(layout) {

    if (!layout) {
        return
    }

    if (layout.player) {

        applyHudPosition(
            playerStats,
            layout.player
        )

    }

    if (layout.compass) {

        applyHudPosition(
            compassWrapper,
            layout.compass
        )

    }

    if (layout.status) {

        applyHudPosition(
            statusBars,
            layout.status
        )

    }

    if (layout.vehicle) {

        applyHudPosition(
            vehicleHud,
            layout.vehicle
        )

    }

}


//=========================================================
// MINIMAP BORDER
//=========================================================

function setMinimapBorder(data) {

    if (!minimapBorder) {
        return
    }

    if (!data.visible) {

        minimapBorder.style.display =
            'none'

        return

    }

    const left =
        Number(data.left) || 0

    const top =
        Number(data.top) || 0

    const width =
        Math.max(
            0,
            Number(data.width) || 0
        )

    const height =
        Math.max(
            0,
            Number(data.height) || 0
        )

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

}


//=========================================================
// MINIMAP BORDER VISIBILITY
//=========================================================

function setMinimapBorderVisible(visible) {

    if (!minimapBorder) {
        return
    }

    minimapBorder.style.display =
        visible
            ? 'block'
            : 'none'

}


//=========================================================
// GLOBAL HUD VISIBILITY
//=========================================================

function setHudVisible(visible) {

    const hud =
        document.getElementById('hud')

    if (!hud) {
        return
    }

    hud.style.display =
        visible
            ? 'block'
            : 'none'

}


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

        switch (data.action) {

            //=================================================
            // PLAYER
            //=================================================

            case 'updatePlayer':

                updatePlayer(
                    data.data || data
                )

                break


            case 'player':

                updatePlayer(
                    data.data || data
                )

                break


            //=================================================
            // STATUS
            //=================================================

            case 'updateStatus':

                updateStatus(
                    data.data || data
                )

                break


            case 'status':

                updateStatus(
                    data.data || data
                )

                break


            //=================================================
            // COMPASS
            //=================================================

            case 'updateCompass':

                updateCompass(
                    data.data || data
                )

                break


            case 'compass':

                updateCompass(
                    data.data || data
                )

                break


            //=================================================
            // VEHICLE
            //=================================================

            case 'updateVehicle':

                updateVehicle(
                    data.data || data
                )

                break


            case 'vehicle':

                updateVehicle(
                    data.data || data
                )

                break


            case 'showVehicle':

                if (vehicleHud) {

                    vehicleHud.style.display =
                        'block'

                }

                break


            case 'hideVehicle':

                if (vehicleHud) {

                    vehicleHud.style.display =
                        'none'

                }

                break


            //=================================================
            // HUD VISIBILITY
            //=================================================

            case 'showHud':

                setHudVisible(true)

                break


            case 'hideHud':

                setHudVisible(false)

                break


            //=================================================
            // SAVED HUD LAYOUT
            //=================================================

            case 'applyHudLayout':

                applyHudLayout(
                    data.layout
                )

                break


            //=================================================
            // MINIMAP BORDER
            //=================================================

            case 'setMinimapBorder':

                setMinimapBorder(data)

                break


            case 'setMinimapBorderVisible':

                setMinimapBorderVisible(
                    Boolean(data.visible)
                )

                break


            default:

                break

        }

    }
)