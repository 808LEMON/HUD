//=========================================================
// 808LEMON HUD
// MAIN NUI CONTROLLER
//=========================================================

console.log('[808LEMON HUD] app.js loaded')


//=========================================================
// DOM REFERENCES
//=========================================================


//=========================================================
// TOP RIGHT INFO PANEL
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
// MONEY ANIMATION
//=========================================================

function restartMoneyAnimation(
    element,
    className
) {

    if (!element) {
        return
    }


    // Remove previous animation states

    element.classList.remove(
        'money-increase',
        'money-decrease',
        'money-bump'
    )


    // Force browser reflow so animation can restart

    void element.offsetWidth


    // Apply new state

    element.classList.add(
        className
    )


    element.classList.add(
        'money-bump'
    )


    // Remove animation classes after animation finishes

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
    previousValue
) {

    if (!element) {
        return
    }


    const current =
        Number(newValue)
        || 0


    // Always update the actual number

    element.textContent =
        formatMoney(
            current
        )


    /*
        Do not animate the initial HUD load.

        We only want animation when the player's
        balance actually changes.
    */

    if (
        previousValue === null ||
        previousValue === undefined
    ) {

        return

    }


    //=====================================================
    // MONEY ADDED
    //=====================================================

    if (
        current > previousValue
    ) {

        restartMoneyAnimation(
            element,
            'money-increase'
        )

        return

    }


    //=====================================================
    // MONEY REMOVED
    //=====================================================

    if (
        current < previousValue
    ) {

        restartMoneyAnimation(
            element,
            'money-decrease'
        )

    }

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
    // PLAYER ID
    //=====================================================

    /*
        Supports both:

        id
        playerId

        This gives us some compatibility with older
        lemon-hud messages.
    */

    const incomingPlayerId =
        data.id !== undefined
            ? data.id
            : data.playerId


    if (
        incomingPlayerId !== undefined &&
        playerId
    ) {

        playerId.textContent =
            incomingPlayerId

    }


    //=====================================================
    // CASH
    //=====================================================

    if (
        data.cash !== undefined &&
        playerCash
    ) {

        const newCash =
            Number(
                data.cash
            ) || 0


        updateMoneyValue(
            playerCash,
            newCash,
            previousCash
        )


        previousCash =
            newCash

    }


    //=====================================================
    // BANK
    //=====================================================

    if (
        data.bank !== undefined &&
        playerBank
    ) {

        const newBank =
            Number(
                data.bank
            ) || 0


        updateMoneyValue(
            playerBank,
            newBank,
            previousBank
        )


        previousBank =
            newBank

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
    // JOB GRADE
    //=====================================================

    if (
        data.grade !== undefined &&
        playerGrade
    ) {

        playerGrade.textContent =
            data.grade || ''

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
// DIRECT MONEY CHANGE
//=========================================================

function moneyChanged(data) {

    if (!data) {
        return
    }


    //=====================================================
    // CASH
    //=====================================================

    if (
        data.cash !== undefined &&
        playerCash
    ) {

        const newCash =
            Number(
                data.cash
            ) || 0


        updateMoneyValue(
            playerCash,
            newCash,
            previousCash
        )


        previousCash =
            newCash

    }


    //=====================================================
    // BANK
    //=====================================================

    if (
        data.bank !== undefined &&
        playerBank
    ) {

        const newBank =
            Number(
                data.bank
            ) || 0


        updateMoneyValue(
            playerBank,
            newBank,
            previousBank
        )


        previousBank =
            newBank

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
        Armor can dynamically disappear.

        That changes the status container height, so
        re-anchor the status box above the minimap.
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


        // Small direction pill

        if (
            compassDirection
        ) {

            compassDirection.textContent =
                direction

        }


        // Large direction beside street name

        if (
            locationDirectionValue
        ) {

            locationDirectionValue.textContent =
                direction

        }

    }


    //=====================================================
    // NUMERIC HEADING
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
            String(
                data.left
            ).toUpperCase()

    }


    //=====================================================
    // RIGHT DIRECTION
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
            data.crossing || ''


        crossingName.textContent =
            crossing


        crossingName.style.display =
            crossing
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


        /*
            GTA normally reports engine health on
            approximately a 0-1000 scale.
        */

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

        const seatbeltEnabled =
            Boolean(
                data.seatbelt
            )


        seatbeltIcon
            .classList
            .toggle(
                'active',
                seatbeltEnabled
            )


        seatbeltIcon
            .classList
            .toggle(
                'warning',
                !seatbeltEnabled
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
    // MATCH LEFT EDGE OF MINIMAP
    //=====================================================

    let left =
        lastMinimapGeometry.left


    //=====================================================
    // POSITION DIRECTLY ABOVE MINIMAP
    //=====================================================

    let top =
        lastMinimapGeometry.top -
        statusHeight -
        STATUS_MINIMAP_GAP


    //=====================================================
    // SCREEN BOUNDS
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
    // APPLY POSITION
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
        The player/compass information panel is now
        permanently anchored to the top-right through CSS.

        We intentionally ignore any old player/compass
        coordinates saved by previous versions of the
        editor.
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
        Minimap geometry takes priority over any old
        status coordinates.
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
    // HIDE MINIMAP BORDER
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
    // GET ACTUAL MINIMAP GEOMETRY
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
    // POSITION BORDER
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
    // REPOSITION STATUS
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
            // QB-HUD COMPATIBILITY
            //=================================================

            case 'setHarness':

                break


            default:

                break

        }

    }
)