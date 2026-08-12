//=========================================================
// 808LEMON HUD
// MAIN NUI CONTROLLER
//=========================================================

console.log('[808LEMON HUD] app.js loaded')


//=========================================================
// DOM REFERENCES
//=========================================================


// COMBINED INFO PANEL

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

const fuelFill =
    document.getElementById(
        'fuel-fill'
    )

const engineFill =
    document.getElementById(
        'engine-fill'
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
// MINIMAP
//=========================================================

const minimapBorder =
    document.getElementById(
        'minimap-border'
    )


//=========================================================
// MINIMAP GEOMETRY
//=========================================================

let lastMinimapGeometry =
    null


//=========================================================
// STATUS → MINIMAP
//=========================================================

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
        Number(value)


    if (
        !Number.isFinite(number)
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
        Number(value)
        || 0


    return '$' +
        Math.floor(number)
            .toLocaleString(
                'en-US'
            )

}


//=========================================================
// PERCENTAGE BAR
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


    //=====================================================
    // ID
    //=====================================================

    if (
        data.id !== undefined &&
        playerId
    ) {

        playerId.textContent =
            data.id

    }


    //=====================================================
    // CASH
    //=====================================================

    if (
        data.cash !== undefined &&
        playerCash
    ) {

        playerCash.textContent =
            formatMoney(
                data.cash
            )

    }


    //=====================================================
    // BANK
    //=====================================================

    if (
        data.bank !== undefined &&
        playerBank
    ) {

        playerBank.textContent =
            formatMoney(
                data.bank
            )

    }


    //=====================================================
    // JOB
    //=====================================================

    if (
        data.job !== undefined &&
        playerJob
    ) {

        playerJob.textContent =
            data.job
            || 'Unemployed'

    }


    //=====================================================
    // JOB GRADE
    //=====================================================

    if (
        data.grade !== undefined &&
        playerGrade
    ) {

        playerGrade.textContent =
            data.grade
            || ''

    }


    //=====================================================
    // PANEL VISIBILITY
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


        const hideWhenEmpty =
            Boolean(
                data.hideArmorWhenEmpty
            )


        const shouldShow =
            Boolean(
                data.showArmor
            ) &&
            !(
                hideWhenEmpty &&
                currentArmor <= 0
            )


        armorRow.style.display =
            shouldShow
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


    /*
        If armor disappears, the status panel changes
        height.

        Re-anchor it immediately above the minimap.
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


    //=====================================================
    // COMPASS VISIBILITY
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
    // CURRENT DIRECTION
    //=====================================================

    if (
        data.direction !== undefined &&
        compassDirection
    ) {

        compassDirection.textContent =
            data.direction

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
                heading % 360
                + 360
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
    // LEFT DIRECTION
    //=====================================================

    if (
        data.left !== undefined &&
        compassLabelLeft
    ) {

        compassLabelLeft.textContent =
            data.left

    }


    //=====================================================
    // RIGHT DIRECTION
    //=====================================================

    if (
        data.right !== undefined &&
        compassLabelRight
    ) {

        compassLabelRight.textContent =
            data.right

    }


    //=====================================================
    // STREET
    //=====================================================

    if (
        data.street !== undefined &&
        streetName
    ) {

        streetName.textContent =
            data.street
            || 'UNKNOWN ROAD'

    }


    //=====================================================
    // CROSS STREET
    //=====================================================

    if (
        data.crossing !== undefined &&
        crossingName
    ) {

        crossingName.textContent =
            data.crossing
            || ''


        crossingName.style.display =
            data.crossing
                ? 'block'
                : 'none'

    }


    //=====================================================
    // CITY / COUNTY
    //=====================================================

    if (
        data.city !== undefined &&
        cityName
    ) {

        cityName.textContent =
            data.city
            || 'SAN ANDREAS'

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

        const currentGear =
            Number(
                data.gear
            )


        gear.textContent =
            currentGear === 0
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
                ) * 100
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
                data.fuel
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

        let currentEngine =
            Number(
                engineValue
            ) || 0


        if (
            currentEngine > 100
        ) {

            currentEngine =
                currentEngine / 10

        }


        engineFill.style.height =
            `${clamp(
                currentEngine
            )}%`

    }


    //=====================================================
    // MILEAGE
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
                unit || 'MPH'
            ).toUpperCase()


        const distanceUnit =
            currentUnit === 'MPH'
                ? 'MI'
                : 'KM'


        mileage.textContent =
            `${currentMileage
                .toFixed(1)
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

        seatbeltIcon
            .classList
            .toggle(
                'active',
                Boolean(
                    data.seatbelt
                )
            )


        seatbeltIcon
            .classList
            .toggle(
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
// APPLY NORMAL HUD POSITION
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


    //=====================================================
    // LEFT EDGE MATCHES MINIMAP
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

    if (!layout) {
        return
    }


    /*
        Player stats and compass now belong to the
        top-right #minimap-info-panel.

        We intentionally DO NOT apply their old editor
        coordinates anymore.
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


    /*
        Real minimap geometry is the final authority for
        status position.
    */

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
    // HIDDEN
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
    // REAL MINIMAP GEOMETRY
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
    // VISUAL BORDER
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
    // STATUS
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
            // HUD LAYOUT
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