//=========================================================
// 808LEMON HUD EDITOR
//=========================================================

const editorState = {

    open: false,

    layout: null,
    savedLayout: null,
    defaults: null,

    dragging: null,

    dragOffsetX: 0,
    dragOffsetY: 0,

    lastMouseX: 0,
    lastMouseY: 0,

    minimapBusy: false,

    queuedMinimapDX: 0,
    queuedMinimapDY: 0
}


//=========================================================
// COMPONENTS
//=========================================================

const editableComponents = {

    player: {

        element:
            document.getElementById(
                'player-stats'
            ),

        label:
            'PLAYER STATS'

    },

    compass: {

        element:
            document.getElementById(
                'compass-wrapper'
            ),

        label:
            'COMPASS / STREET'

    },

    status: {

        element:
            document.getElementById(
                'status-bars'
            ),

        label:
            'STATUS'

    },

    vehicle: {

        element:
            document.getElementById(
                'vehicle-hud'
            ),

        label:
            'VEHICLE HUD'

    }

}


//=========================================================
// MINIMAP FRAME
//=========================================================

const minimapFrame =
    document.getElementById(
        'minimap-frame'
    )


//=========================================================
// EDITOR CONTROLS
//=========================================================

const saveButton =
    document.getElementById(
        'editor-save'
    )

const resetButton =
    document.getElementById(
        'editor-reset'
    )

const cancelButton =
    document.getElementById(
        'editor-cancel'
    )

const positionReadout =
    document.getElementById(
        'editor-position-readout'
    )


//=========================================================
// HELPERS
//=========================================================

function clamp(
    value,
    minimum,
    maximum
) {

    return Math.min(
        Math.max(
            value,
            minimum
        ),
        maximum
    )
}


function cloneLayout(layout) {

    return JSON.parse(
        JSON.stringify(layout)
    )
}


function getResourceName() {

    if (
        typeof window.GetParentResourceName ===
        'function'
    ) {

        return window.GetParentResourceName()

    }

    return 'lemon-hud'
}


function nuiPost(
    callback,
    data = {}
) {

    return fetch(
        `https://${getResourceName()}/${callback}`,
        {

            method:
                'POST',

            headers: {

                'Content-Type':
                    'application/json; charset=UTF-8'

            },

            body:
                JSON.stringify(data)

        }
    )
}


//=========================================================
// NORMAL COMPONENT POSITION
//=========================================================

function applyComponentPosition(
    name,
    position
) {

    const component =
        editableComponents[name]

    if (
        !component ||
        !component.element ||
        !position
    ) {
        return
    }

    const element =
        component.element

    element.style.left =
        `${position.x}%`

    element.style.top =
        `${position.y}%`

    element.style.right =
        'auto'

    element.style.bottom =
        'auto'
}


//=========================================================
// APPLY LAYOUT
//=========================================================

function applyLayout(layout) {

    if (!layout) {
        return
    }

    Object.keys(
        editableComponents
    ).forEach(
        name => {

            if (!layout[name]) {
                return
            }

            applyComponentPosition(
                name,
                layout[name]
            )

        }
    )
}


//=========================================================
// EDITABLE DECORATION
//=========================================================

function prepareEditableElements() {

    Object.entries(
        editableComponents
    ).forEach(
        ([name, component]) => {

            if (!component.element) {
                return
            }

            component.element
                .classList
                .add(
                    'hud-editable'
                )

            component.element
                .dataset
                .editorLabel =
                    component.label

            component.element
                .dataset
                .hudComponent =
                    name

        }
    )
}


function removeEditableElements() {

    Object.values(
        editableComponents
    ).forEach(
        component => {

            if (!component.element) {
                return
            }

            component.element
                .classList
                .remove(
                    'hud-editable'
                )

        }
    )
}


//=========================================================
// NORMAL DRAG START
//=========================================================

function startNormalDrag(
    event,
    name
) {

    if (!editorState.open) {
        return
    }

    const component =
        editableComponents[name]

    if (
        !component ||
        !component.element
    ) {
        return
    }

    event.preventDefault()

    const rect =
        component.element
            .getBoundingClientRect()

    editorState.dragging =
        name

    editorState.dragOffsetX =
        event.clientX -
        rect.left

    editorState.dragOffsetY =
        event.clientY -
        rect.top

    if (positionReadout) {

        positionReadout.textContent =
            `MOVING ${component.label}`

    }
}


//=========================================================
// MINIMAP DRAG START
//=========================================================

function startMinimapDrag(event) {

    if (
        !editorState.open ||
        !minimapFrame
    ) {
        return
    }

    event.preventDefault()
    event.stopPropagation()

    editorState.dragging =
        'minimap'

    editorState.lastMouseX =
        event.clientX

    editorState.lastMouseY =
        event.clientY

    editorState.queuedMinimapDX =
        0

    editorState.queuedMinimapDY =
        0

    minimapFrame
        .classList
        .add(
            'dragging'
        )

    if (positionReadout) {

        positionReadout.textContent =
            'MOVING MINIMAP'

    }
}


//=========================================================
// SEND MINIMAP DELTAS
//=========================================================

async function flushMinimapMovement() {

    if (
        editorState.minimapBusy
    ) {
        return
    }

    if (
        editorState.queuedMinimapDX === 0 &&
        editorState.queuedMinimapDY === 0
    ) {
        return
    }

    editorState.minimapBusy =
        true

    const dx =
        editorState.queuedMinimapDX

    const dy =
        editorState.queuedMinimapDY

    editorState.queuedMinimapDX =
        0

    editorState.queuedMinimapDY =
        0

    try {

        const response =
            await nuiPost(
                'moveMinimap',
                {
                    dx,
                    dy
                }
            )

        const result =
            await response.json()

        if (
            result &&
            result.success
        ) {

            if (!editorState.layout.minimap) {

                editorState.layout.minimap = {
                    offsetX: 0,
                    offsetY: 0
                }

            }

            editorState.layout
                .minimap
                .offsetX =
                    Number(
                        result.offsetX
                    ) || 0


            editorState.layout
                .minimap
                .offsetY =
                    Number(
                        result.offsetY
                    ) || 0


            if (positionReadout) {

                positionReadout.textContent =
                    `MINIMAP  X: ${
                        editorState.layout
                            .minimap
                            .offsetX
                            .toFixed(4)
                    }  Y: ${
                        editorState.layout
                            .minimap
                            .offsetY
                            .toFixed(4)
                    }`

            }

        }

    } catch (error) {

        console.error(
            '[LEMON HUD] Minimap movement error:',
            error
        )

    } finally {

        editorState.minimapBusy =
            false

    }


    if (
        editorState.queuedMinimapDX !== 0 ||
        editorState.queuedMinimapDY !== 0
    ) {

        requestAnimationFrame(
            flushMinimapMovement
        )

    }
}


//=========================================================
// MOVE DRAG
//=========================================================

function moveDrag(event) {

    if (
        !editorState.open ||
        !editorState.dragging
    ) {
        return
    }


    //=====================================================
    // MINIMAP
    //=====================================================

    if (
        editorState.dragging ===
        'minimap'
    ) {

        const dxPixels =
            event.clientX -
            editorState.lastMouseX

        const dyPixels =
            event.clientY -
            editorState.lastMouseY


        editorState.lastMouseX =
            event.clientX

        editorState.lastMouseY =
            event.clientY


        //=================================================
        // MOVE THE HTML BORDER FIRST
        //=================================================

        const rect =
            minimapFrame
                .getBoundingClientRect()

        let left =
            rect.left +
            dxPixels

        let top =
            rect.top +
            dyPixels


        left =
            clamp(
                left,
                0,
                window.innerWidth -
                rect.width
            )

        top =
            clamp(
                top,
                0,
                window.innerHeight -
                rect.height
            )


        minimapFrame.style.left =
            `${left}px`

        minimapFrame.style.top =
            `${top}px`

        minimapFrame.style.right =
            'auto'

        minimapFrame.style.bottom =
            'auto'


        //=================================================
        // SEND EXACT SAME MOVEMENT TO GTA
        //=================================================

        editorState.queuedMinimapDX +=
            dxPixels /
            window.innerWidth

        editorState.queuedMinimapDY +=
            dyPixels /
            window.innerHeight


        requestAnimationFrame(
            flushMinimapMovement
        )

        return
    }


    //=====================================================
    // NORMAL NUI COMPONENT
    //=====================================================

    const name =
        editorState.dragging

    const component =
        editableComponents[name]

    if (
        !component ||
        !component.element
    ) {
        return
    }


    const element =
        component.element


    const rect =
        element
            .getBoundingClientRect()


    let left =
        event.clientX -
        editorState.dragOffsetX

    let top =
        event.clientY -
        editorState.dragOffsetY


    left =
        clamp(
            left,
            0,
            window.innerWidth -
            rect.width
        )

    top =
        clamp(
            top,
            0,
            window.innerHeight -
            rect.height
        )


    const x =
        (
            left /
            window.innerWidth
        ) * 100

    const y =
        (
            top /
            window.innerHeight
        ) * 100


    editorState.layout[name] = {

        x:
            Number(
                x.toFixed(3)
            ),

        y:
            Number(
                y.toFixed(3)
            )

    }


    applyComponentPosition(
        name,
        editorState.layout[name]
    )


    if (positionReadout) {

        positionReadout.textContent =
            `${component.label}  X: ${x.toFixed(2)}%  Y: ${y.toFixed(2)}%`

    }
}


//=========================================================
// DRAG END
//=========================================================

function stopDrag() {

    if (!editorState.dragging) {
        return
    }

    editorState.dragging =
        null

    if (minimapFrame) {

        minimapFrame
            .classList
            .remove(
                'dragging'
            )

    }
}


//=========================================================
// OPEN EDITOR
//=========================================================

function openEditor(data) {

    editorState.open =
        true

    editorState.layout =
        cloneLayout(
            data.layout
        )

    editorState.savedLayout =
        cloneLayout(
            data.layout
        )

    editorState.defaults =
        cloneLayout(
            data.defaults
        )


    document.body
        .classList
        .add(
            'hud-editing'
        )


    prepareEditableElements()


    applyLayout(
        editorState.layout
    )


    if (positionReadout) {

        positionReadout.textContent =
            'DRAG A HUD COMPONENT'

    }
}


//=========================================================
// CLOSE EDITOR
//=========================================================

function closeEditorUI() {

    editorState.open =
        false

    editorState.dragging =
        null

    editorState.queuedMinimapDX =
        0

    editorState.queuedMinimapDY =
        0


    document.body
        .classList
        .remove(
            'hud-editing'
        )


    removeEditableElements()


    if (minimapFrame) {

        minimapFrame
            .classList
            .remove(
                'dragging'
            )

    }
}


//=========================================================
// SAVE
//=========================================================

async function saveLayout() {

    if (!editorState.open) {
        return
    }

    try {

        await nuiPost(
            'saveHudLayout',
            {
                layout:
                    editorState.layout
            }
        )


        editorState.savedLayout =
            cloneLayout(
                editorState.layout
            )


        closeEditorUI()

    } catch (error) {

        console.error(
            '[LEMON HUD] Save error:',
            error
        )

    }
}


//=========================================================
// RESET
//=========================================================

async function resetLayout() {

    if (!editorState.open) {
        return
    }

    editorState.layout =
        cloneLayout(
            editorState.defaults
        )


    applyLayout(
        editorState.layout
    )


    if (minimapFrame) {

        minimapFrame.style.left =
            '1.45vw'

        minimapFrame.style.top =
            '73.1vh'

        minimapFrame.style.right =
            'auto'

        minimapFrame.style.bottom =
            'auto'

    }


    try {

        await nuiPost(
            'resetHudLayout',
            {}
        )

    } catch (error) {

        console.error(
            '[LEMON HUD] Reset error:',
            error
        )

    }


    if (positionReadout) {

        positionReadout.textContent =
            'DEFAULT LAYOUT RESTORED'

    }
}


//=========================================================
// CANCEL
//=========================================================

async function cancelEditor() {

    if (!editorState.open) {
        return
    }


    applyLayout(
        editorState.savedLayout
    )


    try {

        await nuiPost(
            'closeHudEditor',
            {}
        )

    } catch (error) {

        console.error(
            '[LEMON HUD] Cancel error:',
            error
        )

    }


    closeEditorUI()
}


//=========================================================
// NORMAL DRAG EVENTS
//=========================================================

Object.entries(
    editableComponents
).forEach(
    ([name, component]) => {

        if (!component.element) {
            return
        }

        component.element
            .addEventListener(
                'mousedown',
                event => {

                    startNormalDrag(
                        event,
                        name
                    )

                }
            )

    }
)


//=========================================================
// MINIMAP FRAME DRAG
//=========================================================

if (minimapFrame) {

    minimapFrame
        .addEventListener(
            'mousedown',
            startMinimapDrag
        )

}


//=========================================================
// GLOBAL MOUSE
//=========================================================

window.addEventListener(
    'mousemove',
    moveDrag
)


window.addEventListener(
    'mouseup',
    stopDrag
)


window.addEventListener(
    'blur',
    stopDrag
)


//=========================================================
// BUTTONS
//=========================================================

if (saveButton) {

    saveButton.addEventListener(
        'click',
        saveLayout
    )

}


if (resetButton) {

    resetButton.addEventListener(
        'click',
        resetLayout
    )

}


if (cancelButton) {

    cancelButton.addEventListener(
        'click',
        cancelEditor
    )

}


//=========================================================
// ESC
//=========================================================

window.addEventListener(
    'keydown',
    event => {

        if (!editorState.open) {
            return
        }

        if (
            event.key ===
            'Escape'
        ) {

            cancelEditor()

        }

    }
)


//=========================================================
// NUI MESSAGES
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


            case 'applyHudLayout':

                applyLayout(
                    data.layout
                )

                break


            case 'openHudEditor':

                openEditor(
                    data
                )

                break


            case 'closeHudEditor':

                closeEditorUI()

                break


            case 'hudEditorReset':

                if (
                    data.layout
                ) {

                    editorState.layout =
                        cloneLayout(
                            data.layout
                        )


                    editorState.savedLayout =
                        cloneLayout(
                            data.layout
                        )


                    applyLayout(
                        data.layout
                    )

                }

                break


            default:

                break

        }

    }
)