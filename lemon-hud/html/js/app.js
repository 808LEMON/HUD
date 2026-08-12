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
// MINIMAP GEOMETRY
//=========================================================

let lastMinimapGeometry = null


//=========================================================
// STATUS POSITION
//=========================================================

const STATUS_MINIMAP_GAP = 4

const CENTER_STATUS_OVER_MINIMAP = false


//=========================================================
// HELPERS
//=========================================================

function clamp(
    value,
    minimum = 0,
    maximum = 100
) {

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
// MONEY
//=========================================================

function formatMoney(value) {

    const number =
        Number(value) || 0

    return '$' +
        Math.floor(number)
            .toLocaleString('en-US')

}


//=========================================================
// STATUS BAR WIDTH
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
// PLAYER
//=========================================================

function updatePlayer(data) {

    if (!data) {
        return
    }


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


    if (
        data.cash !== undefined &&
        playerCash
    ) {

        playerCash.textContent =
            formatMoney(
                data.cash
            )

    }


    if (
        data.bank !== undefined &&
        playerBank
    ) {

        playerBank.textContent =
            formatMoney(
                data.bank
            )

    }


    if (
        data.job !== undefined &&
        playerJob
    ) {

        playerJob.textContent =
            data.job ||
            'Unemployed'

    }


    if (
        data.grade !== undefined &&
        playerGrade
    ) {

        playerGrade.textContent =
            data.grade || ''

    }


    if (
        data.visible !== undefined &&
        playerStats
    ) {

        playerStats.style.display =
            data.visible
                ? 'block'
                : 'none'

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
    // HEALTH ROW
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
    // ARMOR ROW
    //=====================================================

    if (
        armorRow &&
        data.showArmor !== undefined
    ) {

        const armor =
            Number(
                data.armor
            ) || 0


        const hideWhenEmpty =
            Boolean(
                data.hideArmorWhenEmpty
            )


        const shouldShowArmor =
            Boolean(data.showArmor) &&
            !(
                hideWhenEmpty &&
                armor <= 0
            )


        armorRow.style.display =
            shouldShowArmor
                ? 'grid'
                : 'none'

    }


    //=====================================================
    // HUNGER ROW
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
    // THIRST ROW
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


    /*
        Armor disappearing changes the total status panel
        height, so snap the panel back above the minimap.
    */

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

        let heading =
            Math.round(
                Number(
                    data.heading
                ) || 0
            )


        heading =
            (
                (
                    heading % 360
                ) + 360
            ) % 360


        compassHeading.textContent =
            `${String(heading)
                .padStart(3, '0')}°`

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
            data.street ||
            'UNKNOWN ROAD'

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

        speed.textContent =
            Math.round(
                Number(
                    data.speed
                ) || 0
            )

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
            String(unit)
                .toUpperCase()

    }


    //=====================================================
    // GEAR
    //=====================================================

    if (
        data.gear !== undefined &&
        gear
    ) {

        const gearValue =
            Number(
                data.gear
            )


        gear.textContent =
            gearValue === 0
                ? 'N'
                : String(
                    data.gear
                )

    }


    //=====================================================
    // RPM
    //=====================================================

    if (
        data.rpm !== undefined &&
        rpmRing
    ) {

        const rpm =
            clamp(
                Number(
                    data.rpm
                ) * 100,
                0,
                100
            )


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


    //=====================================================
    // FUEL
    //=====================================================

    if (
        data.fuel !== undefined &&
        fuelFill
    ) {

        fuelFill.style.height =
            `${clamp(
                data.fuel,
                0,
                100
            )}%`

    }


    //=====================================================
    // ENGINE
    //=====================================================

    const engineValue =
        data.engine !== undefined
            ? data.engine
            : data.engineHealth


    if (
        engineValue !== undefined &&
        engineFill
    ) {

        let engine =
            Number(
                engineValue
            ) || 0


        if (engine > 100) {
            engine /= 10
        }


        engineFill.style.height =
            `${clamp(
                engine,
                0,
                100
            )}%`

    }


    //=====================================================
    // MILEAGE
    //=====================================================

    if (
        data.mileage !== undefined &&
        mileage
    ) {

        const mileageValue =
            Number(
                data.mileage
            ) || 0


        const currentUnit =
            String(
                unit || 'MPH'
            ).toUpperCase()


        const distanceUnit =
            currentUnit === 'MPH'
                ? 'MI'
                : 'KM'


        mileage.textContent =
            `${mileageValue
                .toFixed(1)
                .padStart(6, '0')} ${distanceUnit}`

    }


    //=====================================================
    // HEADLIGHTS
    //=====================================================

    if (headlightIcon) {

        const lights =
            data.headlights !== undefined
                ? data.headlights
                : data.lights


        if (
            lights !== undefined
        ) {

            headlightIcon.classList.toggle(
                'active',
                Boolean(lights)
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

        seatbeltIcon.classList.toggle(
            'active',
            Boolean(
                data.seatbelt
            )
        )


        seatbeltIcon.classList.toggle(
            'warning',
            !Boolean(
                data.seatbelt
            )
        )

    }


    //=====================================================
    // CRUISE
    //=====================================================

    if (
        data.cruise !== undefined &&
        cruiseIcon
    ) {

        cruiseIcon.classList.toggle(
            'active',
            Boolean(
                data.cruise
            )
        )

    }

}


//=========================================================
// APPLY HUD POSITION
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


    let left =
        lastMinimapGeometry.left


    if (
        CENTER_STATUS_OVER_MINIMAP
    ) {

        left =
            lastMinimapGeometry.left +
            (
                lastMinimapGeometry.width -
                statusWidth
            ) / 2

    }


    let top =
        lastMinimapGeometry.top -
        statusHeight -
        STATUS_MINIMAP_GAP


    //=====================================================
    // SCREEN CLAMP
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
        `${Math.round(left)}px`


    statusBars.style.top =
        `${Math.round(top)}px`


    statusBars.style.right =
        'auto'


    statusBars.style.bottom =
        'auto'

}


//=========================================================
// APPLY HUD LAYOUT
//=========================================================

function applyHudLayout(layout) {

    if (!layout) {
        return
    }


    if (
        layout.player
    ) {

        applyHudPosition(
            playerStats,
            layout.player
        )

    }


    if (
        layout.compass
    ) {

        applyHudPosition(
            compassWrapper,
            layout.compass
        )

    }


    /*
        We still allow the editor/default layout to position
        status initially.

        As soon as the real minimap geometry is available,
        anchorStatusToMinimap() becomes the final source of
        truth.
    */

    if (
        layout.status
    ) {

        applyHudPosition(
            statusBars,
            layout.status
        )

    }


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

    if (!minimapBorder) {
        return
    }


    if (
        !data.visible
    ) {

        minimapBorder.style.display =
            'none'


        lastMinimapGeometry =
            null


        return
    }


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


    requestAnimationFrame(
        anchorStatusToMinimap
    )

}


//=========================================================
// BORDER VISIBILITY
//=========================================================

function setMinimapBorderVisible(
    visible
) {

    if (!minimapBorder) {
        return
    }


    minimapBorder.style.display =
        visible
            ? 'block'
            : 'none'


    if (visible) {

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


    if (!hud) {
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
// MESSAGE HANDLER
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

                }

                break


            case 'hideVehicle':

                if (
                    vehicleHud
                ) {

                    vehicleHud.style.display =
                        'none'

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
            // COMPATIBILITY
            //=================================================

            case 'setHarness':

                break


            default:

                break

        }

    }
)