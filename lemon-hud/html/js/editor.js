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

    minimapFrameWidth: 12.30,
    minimapFrameHeight: 10.85,

    minimapRequestBusy: false,
    queuedMinimapPosition: null

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
// MINIMAP
//=========================================================

const minimapFrame =
    document.getElementById(
        'minimap-frame'
    )


//=========================================================
// CONTROLS
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

            method: 'POST',

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
// APPLY STANDARD COMPONENT
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
// APPLY MINIMAP FRAME
//=========================================================

function applyMinimapFrame(
    position
) {

    if (
        !minimapFrame ||
        !position
    ) {
        return
    }

    minimapFrame.style.left =
        `${position.x}%`

    minimapFrame.style.top =
        `${position.y}%`

    minimapFrame.style.width =
        `${editorState.minimapFrameWidth}vw`

    minimapFrame.style.height =
        `${editorState.minimapFrameHeight}vh`

    minimapFrame.style.right =
        'auto'

    minimapFrame.style.bottom =
        'auto'

}


//=========================================================
// APPLY FULL NUI LAYOUT
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

    if (
        layout.minimap
    ) {

        applyMinimapFrame(
            layout.minimap
        )

    }

}


//=========================================================
// EDIT DECORATIONS
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
// START NORMAL DRAG
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
// START MINIMAP DRAG
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

    const rect =
        minimapFrame
            .getBoundingClientRect()

    editorState.dragging =
        'minimap'

    editorState.dragOffsetX =
        event.clientX -
        rect.left

    editorState.dragOffsetY =
        event.clientY -
        rect.top

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
// SEND ABSOLUTE MINIMAP POSITION
//=========================================================

async function flushMinimapPosition() {

    if (
        editorState.minimapRequestBusy
    ) {
        return
    }

    if (
        !editorState.queuedMinimapPosition
    ) {
        return
    }

    editorState.minimapRequestBusy =
        true

    const position =
        editorState.queuedMinimapPosition

    editorState.queuedMinimapPosition =
        null

    try {

        const response =
            await nuiPost(
                'setMinimapPosition',
                {

                    x:
                        position.x,

                    y:
                        position.y

                }
            )

        const result =
            await response.json()

        if (
            result &&
            result.success
        ) {

            editorState.layout.minimap = {

                x:
                    Number(result.x),

                y:
                    Number(result.y)

            }

        }

    } catch (error) {

        console.error(
            '[LEMON HUD] Minimap position error:',
            error
        )

    } finally {

        editorState.minimapRequestBusy =
            false

    }

    if (
        editorState.queuedMinimapPosition
    ) {

        requestAnimationFrame(
            flushMinimapPosition
        )

    }

}


//=========================================================
// QUEUE ABSOLUTE MINIMAP POSITION
//=========================================================

function queueMinimapPosition(
    x,
    y
) {

    editorState.queuedMinimapPosition = {
        x,
        y
    }

    requestAnimationFrame(
        flushMinimapPosition
    )

}


//=========================================================
// MOUSE MOVE
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

        const frameWidth =
            minimapFrame.offsetWidth

        const frameHeight =
            minimapFrame.offsetHeight

        let leftPx =
            event.clientX -
            editorState.dragOffsetX

        let topPx =
            event.clientY -
            editorState.dragOffsetY


        leftPx =
            clamp(
                leftPx,
                0,
                window.innerWidth -
                frameWidth
            )


        topPx =
            clamp(
                topPx,
                0,
                window.innerHeight -
                frameHeight
            )


        const x =
            (
                leftPx /
                window.innerWidth
            ) * 100


        const y =
            (
                topPx /
                window.innerHeight
            ) * 100


        editorState.layout.minimap = {

            x:
                Number(
                    x.toFixed(4)
                ),

            y:
                Number(
                    y.toFixed(4)
                )

        }


        //=================================================
        // BORDER
        //=================================================

        applyMinimapFrame(
            editorState.layout.minimap
        )


        //=================================================
        // ACTUAL GTA RADAR
        //=================================================

        queueMinimapPosition(
            editorState.layout.minimap.x,
            editorState.layout.minimap.y
        )


        if (positionReadout) {

            positionReadout.textContent =
                `MINIMAP  X: ${x.toFixed(2)}%  Y: ${y.toFixed(2)}%`

        }

        return

    }


    //=====================================================
    // NORMAL HUD
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


    let leftPx =
        event.clientX -
        editorState.dragOffsetX


    let topPx =
        event.clientY -
        editorState.dragOffsetY


    leftPx =
        clamp(
            leftPx,
            0,
            window.innerWidth -
            rect.width
        )


    topPx =
        clamp(
            topPx,
            0,
            window.innerHeight -
            rect.height
        )


    const x =
        (
            leftPx /
            window.innerWidth
        ) * 100


    const y =
        (
            topPx /
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
// STOP DRAG
//=========================================================

function stopDrag() {

    if (
        !editorState.dragging
    ) {
        return
    }

    editorState.dragging =
        null

    if (
        minimapFrame
    ) {

        minimapFrame
            .classList
            .remove(
                'dragging'
            )

    }

}


//=========================================================
// OPEN
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


    if (
        data.minimapFrame
    ) {

        editorState.minimapFrameWidth =
            Number(
                data.minimapFrame.width
            )
            || editorState.minimapFrameWidth


        editorState.minimapFrameHeight =
            Number(
                data.minimapFrame.height
            )
            || editorState.minimapFrameHeight

    }


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
// CLOSE
//=========================================================

function closeEditorUI() {

    editorState.open =
        false

    editorState.dragging =
        null

    editorState.queuedMinimapPosition =
        null


    document.body
        .classList
        .remove(
            'hud-editing'
        )


    removeEditableElements()


    if (
        minimapFrame
    ) {

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
            '[LEMON HUD] Reset error:',
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
            '[LEMON HUD] Cancel error:',
            error
        )

    }

    closeEditorUI()

}


//=========================================================
// NORMAL DRAG LISTENERS
//=========================================================

Object.entries(
    editableComponents
).forEach(
    ([name, component]) => {

        if (
            !component.element
        ) {
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
// MINIMAP DRAG LISTENER
//=========================================================

if (
    minimapFrame
) {

    minimapFrame
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
// BUTTONS
//=========================================================

if (
    saveButton
) {

    saveButton
        .addEventListener(
            'click',
            saveLayout
        )

}


if (
    resetButton
) {

    resetButton
        .addEventListener(
            'click',
            resetLayout
        )

}


if (
    cancelButton
) {

    cancelButton
        .addEventListener(
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

        if (
            !editorState.open
        ) {
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

                if (
                    data.minimapFrame
                ) {

                    editorState.minimapFrameWidth =
                        Number(
                            data.minimapFrame.width
                        )
                        || editorState.minimapFrameWidth


                    editorState.minimapFrameHeight =
                        Number(
                            data.minimapFrame.height
                        )
                        || editorState.minimapFrameHeight

                }


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
                    data.minimapFrame
                ) {

                    editorState.minimapFrameWidth =
                        Number(
                            data.minimapFrame.width
                        )
                        || editorState.minimapFrameWidth


                    editorState.minimapFrameHeight =
                        Number(
                            data.minimapFrame.height
                        )
                        || editorState.minimapFrameHeight

                }


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