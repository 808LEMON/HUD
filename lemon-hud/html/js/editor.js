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

    minimapStartMouseX: 0,
    minimapStartMouseY: 0,

    minimapStartX: 0,
    minimapStartY: 0,

    previewTimeout: null

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
// MINIMAP MOVE HANDLE
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


function nuiPost(
    callback,
    data = {}
) {

    return fetch(
        `https://${GetParentResourceName()}/${callback}`,
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
// NORMAL NUI POSITION
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
// MINIMAP HANDLE POSITION
//=========================================================

function applyMinimapHandlePosition(position) {

    if (
        !minimapHandle ||
        !position
    ) {
        return
    }

    /*
        The handle does NOT represent the radar bounds.

        It is simply attached to the saved minimap
        coordinate so you can grab it and move the
        real native radar.

        A small visual offset puts it approximately above
        the radar without pretending to match its edges.
    */

    minimapHandle.style.left =
        `${position.x}%`

    minimapHandle.style.top =
        `${Math.max(position.y - 3.0, 0)}%`

    minimapHandle.style.right =
        'auto'

    minimapHandle.style.bottom =
        'auto'
}


//=========================================================
// APPLY WHOLE LAYOUT
//=========================================================

function applyLayout(layout) {

    if (!layout)
        return

    Object.keys(
        editableComponents
    ).forEach(name => {

        if (!layout[name])
            return

        applyComponentPosition(
            name,
            layout[name]
        )

    })

    if (layout.minimap) {

        applyMinimapHandlePosition(
            layout.minimap
        )

    }
}


//=========================================================
// DECORATIONS
//=========================================================

function prepareEditableElements() {

    Object.entries(
        editableComponents
    ).forEach(
        ([name, component]) => {

            if (!component.element)
                return

            component.element
                .classList
                .add('hud-editable')

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
    ).forEach(component => {

        if (!component.element)
            return

        component.element
            .classList
            .remove('hud-editable')

    })
}


//=========================================================
// NORMAL COMPONENT DRAG START
//=========================================================

function startDrag(
    event,
    name
) {

    if (!editorState.open)
        return

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

    positionReadout.textContent =
        `MOVING ${component.label}`
}


//=========================================================
// MINIMAP DRAG START
//=========================================================

function startMinimapDrag(event) {

    if (!editorState.open)
        return

    event.preventDefault()

    editorState.dragging =
        'minimap'

    editorState.minimapStartMouseX =
        event.clientX

    editorState.minimapStartMouseY =
        event.clientY

    editorState.minimapStartX =
        Number(
            editorState.layout.minimap.x
        ) || 0

    editorState.minimapStartY =
        Number(
            editorState.layout.minimap.y
        ) || 0

    minimapHandle.classList.add(
        'dragging'
    )

    positionReadout.textContent =
        'MOVING NATIVE MINIMAP'
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

    //-----------------------------------------------------
    // MINIMAP
    //-----------------------------------------------------

    if (
        editorState.dragging ===
        'minimap'
    ) {

        const viewportWidth =
            window.innerWidth

        const viewportHeight =
            window.innerHeight


        const mouseDeltaX =
            event.clientX -
            editorState.minimapStartMouseX

        const mouseDeltaY =
            event.clientY -
            editorState.minimapStartMouseY


        /*
            Convert exact mouse movement into screen
            percentage movement.

            This means:

            mouse moves 100px right
                    ↓
            minimap moves equivalent normalized amount
            right

            We no longer care about the fake HTML radar
            dimensions.
        */

        const deltaX =
            (
                mouseDeltaX /
                viewportWidth
            ) * 100

        const deltaY =
            (
                mouseDeltaY /
                viewportHeight
            ) * 100


        let x =
            editorState.minimapStartX +
            deltaX

        let y =
            editorState.minimapStartY +
            deltaY


        /*
            Give the minimap a little safety boundary.
        */

        x =
            clamp(
                x,
                -5,
                92
            )

        y =
            clamp(
                y,
                5,
                92
            )


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


        applyMinimapHandlePosition(
            editorState.layout.minimap
        )


        positionReadout.textContent =
            `MINIMAP  X: ${x.toFixed(2)}%  Y: ${y.toFixed(2)}%`


        schedulePreview()

        return
    }


    //-----------------------------------------------------
    // NORMAL HTML HUD
    //-----------------------------------------------------

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


    positionReadout.textContent =
        `${component.label}  X: ${x.toFixed(2)}%  Y: ${y.toFixed(2)}%`
}


//=========================================================
// DRAG END
//=========================================================

function stopDrag() {

    if (
        !editorState.open ||
        !editorState.dragging
    ) {
        return
    }

    const wasMinimap =
        editorState.dragging ===
        'minimap'

    editorState.dragging =
        null


    if (
        minimapHandle
    ) {

        minimapHandle.classList.remove(
            'dragging'
        )

    }


    if (wasMinimap) {

        /*
            Send one final exact update.
        */

        previewLayout()

    }
}


//=========================================================
// MINIMAP PREVIEW
//=========================================================

function schedulePreview() {

    if (
        editorState.previewTimeout
    ) {
        return
    }

    editorState.previewTimeout =
        setTimeout(
            () => {

                editorState.previewTimeout =
                    null

                previewLayout()

            },
            16
        )
}


function previewLayout() {

    nuiPost(
        'previewHudLayout',
        {
            layout:
                editorState.layout
        }
    )
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


    positionReadout.textContent =
        'DRAG A HUD COMPONENT'
}


//=========================================================
// CLOSE UI
//=========================================================

function closeEditorUI() {

    editorState.open =
        false

    editorState.dragging =
        null


    document.body
        .classList
        .remove(
            'hud-editing'
        )


    removeEditableElements()


    if (minimapHandle) {

        minimapHandle.classList.remove(
            'dragging'
        )

    }
}


//=========================================================
// SAVE
//=========================================================

function saveLayout() {

    if (!editorState.open)
        return


    nuiPost(
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
}


//=========================================================
// RESET
//=========================================================

function resetLayout() {

    if (!editorState.open)
        return


    editorState.layout =
        cloneLayout(
            editorState.defaults
        )


    applyLayout(
        editorState.layout
    )


    previewLayout()


    nuiPost(
        'resetHudLayout',
        {}
    )


    positionReadout.textContent =
        'DEFAULT LAYOUT RESTORED'
}


//=========================================================
// CANCEL
//=========================================================

function cancelEditor() {

    if (!editorState.open)
        return


    applyLayout(
        editorState.savedLayout
    )


    nuiPost(
        'closeHudEditor',
        {}
    )


    closeEditorUI()
}


//=========================================================
// NORMAL COMPONENT DRAG EVENTS
//=========================================================

Object.entries(
    editableComponents
).forEach(
    ([name, component]) => {

        if (!component.element)
            return


        component.element
            .addEventListener(
                'mousedown',
                event => {

                    startDrag(
                        event,
                        name
                    )

                }
            )

    }
)


//=========================================================
// MINIMAP HANDLE DRAG
//=========================================================

if (minimapHandle) {

    minimapHandle.addEventListener(
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


//=========================================================
// BUTTONS
//=========================================================

saveButton.addEventListener(
    'click',
    saveLayout
)


resetButton.addEventListener(
    'click',
    resetLayout
)


cancelButton.addEventListener(
    'click',
    cancelEditor
)


//=========================================================
// ESCAPE
//=========================================================

window.addEventListener(
    'keydown',
    event => {

        if (!editorState.open)
            return


        if (
            event.key === 'Escape'
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

        }

    }
)