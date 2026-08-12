//=========================================================
// 808LEMON HUD EDITOR
//=========================================================

const editorState = {
    open: false,
    layout: null,
    savedLayout: null,
    defaults: null,

    dragging: null,

    offsetX: 0,
    offsetY: 0,

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
// MINIMAP HANDLE
//=========================================================

const minimapHandle =
    document.getElementById(
        'minimap-editor-handle'
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

    /*
        Using window.GetParentResourceName prevents
        VS Code from flagging GetParentResourceName
        as an undefined global.
    */

    if (
        typeof window.GetParentResourceName ===
        'function'
    ) {

        return window.GetParentResourceName()

    }

    /*
        Browser testing fallback.
    */

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
// NORMAL HUD COMPONENT POSITION
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
// APPLY NUI LAYOUT
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
// EDITOR DECORATIONS
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
// NORMAL COMPONENT DRAG START
//=========================================================

function startNormalDrag(
    event,
    name
) {

    if (!editorState.open) {
        return
    }

    if (
        event.target.closest(
            '#hud-editor-panel'
        )
    ) {
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

    editorState.offsetX =
        event.clientX -
        rect.left

    editorState.offsetY =
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
        !minimapHandle
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

    minimapHandle
        .classList
        .add(
            'dragging'
        )

    if (positionReadout) {

        positionReadout.textContent =
            'MOVING NATIVE MINIMAP'

    }
}


//=========================================================
// SEND MINIMAP MOVEMENT TO LUA
//=========================================================

async function flushMinimapMovement() {

    /*
        Don't send another callback while one is
        already waiting for Lua.
    */

    if (editorState.minimapBusy) {
        return
    }

    /*
        Nothing queued.
    */

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

    /*
        Clear current queue.

        Any mouse movement while Lua is handling the
        callback will be added back into the queue.
    */

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

            editorState.layout.minimap = {

                offsetX:
                    Number(
                        result.offsetX
                    ) || 0,

                offsetY:
                    Number(
                        result.offsetY
                    ) || 0

            }

            if (positionReadout) {

                positionReadout.textContent =
                    `MINIMAP  X OFFSET: ${
                        editorState.layout
                            .minimap
                            .offsetX
                            .toFixed(4)
                    }  Y OFFSET: ${
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

    /*
        More mouse movement may have happened while
        the previous NUI callback was running.
    */

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
// DRAG MOVE
//=========================================================

function moveDrag(event) {

    if (
        !editorState.open ||
        !editorState.dragging
    ) {
        return
    }


    //=====================================================
    // NATIVE MINIMAP
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


        /*
            Update last known cursor position immediately
            so every movement is relative to the previous
            mouse event.
        */

        editorState.lastMouseX =
            event.clientX

        editorState.lastMouseY =
            event.clientY


        /*
            Convert pixel movement into FiveM normalized
            screen movement.
        */

        const dx =
            dxPixels /
            window.innerWidth

        const dy =
            dyPixels /
            window.innerHeight


        editorState.queuedMinimapDX +=
            dx

        editorState.queuedMinimapDY +=
            dy


        requestAnimationFrame(
            flushMinimapMovement
        )

        return
    }


    //=====================================================
    // NORMAL HTML COMPONENT
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


    const viewportWidth =
        window.innerWidth

    const viewportHeight =
        window.innerHeight


    const rect =
        element.getBoundingClientRect()


    let leftPx =
        event.clientX -
        editorState.offsetX

    let topPx =
        event.clientY -
        editorState.offsetY


    /*
        Prevent components from leaving the screen.
    */

    leftPx =
        clamp(
            leftPx,
            0,
            viewportWidth -
            rect.width
        )

    topPx =
        clamp(
            topPx,
            0,
            viewportHeight -
            rect.height
        )


    /*
        Convert pixels into screen percentages.
    */

    const x =
        (
            leftPx /
            viewportWidth
        ) * 100

    const y =
        (
            topPx /
            viewportHeight
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

    if (minimapHandle) {

        minimapHandle
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
// CLOSE EDITOR UI
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


    if (minimapHandle) {

        minimapHandle
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
            '[LEMON HUD] Save layout error:',
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


    try {

        await nuiPost(
            'resetHudLayout',
            {}
        )


        if (positionReadout) {

            positionReadout.textContent =
                'DEFAULT LAYOUT RESTORED'

        }

    } catch (error) {

        console.error(
            '[LEMON HUD] Reset layout error:',
            error
        )

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
            '[LEMON HUD] Close editor error:',
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
// MINIMAP DRAG EVENT
//=========================================================

if (minimapHandle) {

    minimapHandle
        .addEventListener(
            'mousedown',
            startMinimapDrag
        )

}


//=========================================================
// GLOBAL MOUSE EVENTS
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
// EDITOR BUTTONS
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
// ESCAPE
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


            //=================================================
            // APPLY SAVED LAYOUT
            //=================================================

            case 'applyHudLayout':

                applyLayout(
                    data.layout
                )

                break


            //=================================================
            // OPEN EDITOR
            //=================================================

            case 'openHudEditor':

                openEditor(
                    data
                )

                break


            //=================================================
            // CLOSE EDITOR
            //=================================================

            case 'closeHudEditor':

                closeEditorUI()

                break


            //=================================================
            // RESET
            //=================================================

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