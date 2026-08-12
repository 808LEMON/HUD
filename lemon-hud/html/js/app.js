//=========================================================
// 808LEMON HUD
// MAIN NUI CONTROLLER
//=========================================================

console.log('[808LEMON HUD] app.js loaded')


//=========================================================
// DOM
//=========================================================


// COMBINED INFO PANEL

const minimapInfoPanel =
    document.getElementById(
        'minimap-info-panel'
    )


// PLAYER

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


// COMPASS

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


// STATUS

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


// VEHICLE

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


// MINIMAP

const minimapBorder =
    document.getElementById(
        'minimap-border'
    )


//=========================================================
// MINIMAP GEOMETRY
//=========================================================

let lastMinimapGeometry =
    null


const STATUS_MINIMAP_GAP =
    4


const INFO_PANEL_MINIMAP_GAP =
    6


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
// MONEY
//=========================================================

function formatMoney(value) {

    const number =
        Number(value) || 0

    return '$' +
        Math.floor(number)
            .toLocaleString(
                'en-US'
            )
}


//=========================================================
// PERCENTAGE
//=========================================================

function setPercentage(
    element,
    value
) {

    if (!element) {
        return
    }

    element.style.width =
        `${clamp(value)}%`
}


//=========================================================
// PLAYER
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


    /*
        We hide/show the entire combined panel rather
        than independently positioning player stats.
    */

    if (
        data.visible !== undefined &&
        minimapInfoPanel
    ) {

        minimapInfoPanel.dataset.playerVisible =
            data.visible
                ? 'true'
                : 'false'

    }

}


//=========================================================
// STATUS
//=========================================================

function updateStatus(data) {

    if (!data) {
        return
    }


    if (
        data.health !== undefined
    ) {

        setPercentage(
            healthFill,
            data.health
        )

    }


    if (
        data.armor !== undefined
    ) {

        setPercentage(
            armorFill,
            data.armor
        )

    }


    if (
        data.hunger !== undefined
    ) {

        setPercentage(
            hungerFill,
            data.hunger
        )

    }


    if (
        data.thirst !== undefined
    ) {

        setPercentage(
            thirstFill,
            data.thirst
        )

    }


    if (
        healthRow &&
        data.showHealth !== undefined
    ) {

        healthRow.style.display =
            data.showHealth
                ? 'grid'
                : 'none'

    }


    if (
        armorRow &&
        data.showArmor !== undefined
    ) {

        const armor =
            Number(
                data.armor
            ) || 0

        const shouldShow =
            Boolean(
                data.showArmor
            ) &&
            !(
                Boolean(
                    data.hideArmorWhenEmpty
                ) &&
                armor <= 0
            )

        armorRow.style.display =
            shouldShow
                ? 'grid'
                : 'none'

    }


    if (
        hungerRow &&
        data.showHunger !== undefined
    ) {

        hungerRow.style.display =
            data.showHunger
                ? 'grid'
                : 'none'

    }


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
        positionMinimapCluster
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
        data.visible !== undefined &&
        compassWrapper
    ) {

        compassWrapper.style.display =
            data.visible
                ? 'block'
                : 'none'

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


    if (
        data.city !== undefined &&
        cityName
    ) {

        cityName.textContent =
            data.city ||
            'SAN ANDREAS'

    }


    requestAnimationFrame(
        positionMinimapCluster
    )
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


    if (
        data.fuel !== undefined &&
        fuelFill
    ) {

        fuelFill.style.height =
            `${clamp(
                data.fuel
            )}%`

    }


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

        if (
            engine > 100
        ) {

            engine =
                engine / 10

        }

        engineFill.style.height =
            `${clamp(
                engine
            )}%`

    }


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


    if (headlightIcon) {

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
                    Boolean(lights)
                )

        }

    }


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
// NORMAL HUD POSITION
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
// POSITION MINIMAP CLUSTER
//=========================================================

function positionMinimapCluster() {

    if (
        !lastMinimapGeometry
    ) {
        return
    }


    //=====================================================
    // STATUS ABOVE MINIMAP
    //=====================================================

    if (statusBars) {

        const statusWidth =
            statusBars.offsetWidth

        const statusHeight =
            statusBars.offsetHeight

        let statusLeft =
            lastMinimapGeometry.left

        let statusTop =
            lastMinimapGeometry.top -
            statusHeight -
            STATUS_MINIMAP_GAP

        statusLeft =
            Math.max(
                0,
                Math.min(
                    statusLeft,
                    window.innerWidth -
                    statusWidth
                )
            )

        statusTop =
            Math.max(
                0,
                statusTop
            )

        statusBars.style.left =
            `${Math.round(
                statusLeft
            )}px`

        statusBars.style.top =
            `${Math.round(
                statusTop
            )}px`

        statusBars.style.right =
            'auto'

        statusBars.style.bottom =
            'auto'

    }


    //=====================================================
    // INFO PANEL RIGHT OF MINIMAP
    //=====================================================

    if (minimapInfoPanel) {

        const panelWidth =
            minimapInfoPanel.offsetWidth

        const panelHeight =
            minimapInfoPanel.offsetHeight

        let panelLeft =
            lastMinimapGeometry.left +
            lastMinimapGeometry.width +
            INFO_PANEL_MINIMAP_GAP

        /*
            Your mockup has the top aligned with the
            minimap top edge.
        */

        let panelTop =
            lastMinimapGeometry.top


        //=================================================
        // SCREEN SAFETY
        //=================================================

        if (
            panelLeft +
            panelWidth >
            window.innerWidth
        ) {

            panelLeft =
                lastMinimapGeometry.left -
                panelWidth -
                INFO_PANEL_MINIMAP_GAP

        }


        panelTop =
            Math.max(
                0,
                Math.min(
                    panelTop,
                    window.innerHeight -
                    panelHeight
                )
            )


        minimapInfoPanel.style.left =
            `${Math.round(
                panelLeft
            )}px`

        minimapInfoPanel.style.top =
            `${Math.round(
                panelTop
            )}px`

        minimapInfoPanel.style.right =
            'auto'

        minimapInfoPanel.style.bottom =
            'auto'

    }

}


//=========================================================
// APPLY HUD LAYOUT
//=========================================================

function applyHudLayout(layout) {

    if (!layout) {
        return
    }


    /*
        Player + Compass are deliberately NOT positioned
        from old editor layout anymore.

        They are inside #minimap-info-panel now.
    */


    if (
        layout.vehicle
    ) {

        applyHudPosition(
            vehicleHud,
            layout.vehicle
        )

    }


    /*
        Status may briefly receive the old editor position,
        but the real minimap geometry becomes final.
    */

    if (
        layout.status
    ) {

        applyHudPosition(
            statusBars,
            layout.status
        )

    }


    requestAnimationFrame(
        positionMinimapCluster
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
        positionMinimapCluster
    )

}


//=========================================================
// MINIMAP BORDER VISIBILITY
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
            positionMinimapCluster
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
// RESIZE
//=========================================================

window.addEventListener(
    'resize',
    () => {

        requestAnimationFrame(
            positionMinimapCluster
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


            case 'applyHudLayout':

                applyHudLayout(
                    data.layout
                )

                break


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


            case 'setHarness':

                break


            default:

                break

        }

    }
)