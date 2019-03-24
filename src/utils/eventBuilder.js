const pointerEvents = {
    start: 'pointerdown',
    move: 'pointermove',
    end: 'pointerup'
};

const touchEvents = {
    start: 'touchstart',
    move: 'touchmove',
    end: 'touchend'
};

const mouseEvents = {
    start: 'mousedown',
    move: 'mousemove',
    end: 'mouseup'
};

const _addEventListeners = (types, elem, callback, notPassive) => {
    types.split(' ').forEach(function (type) {
        elem.addEventListener(type, callback, { passive: !notPassive });
    }, this);
}

const addEventListener = (elem, event, callback, notPassive) => {
    if (window.PointerEvent) {
        //pointer Events
        _addEventListeners(pointerEvents[event], elem, callback, notPassive);
        if (elem !== document) {
            _addEventListeners('touchstart touchmove touchend', elem, (event) => { event.preventDefault()}, true);
        }
    } else if (window.TouchEvent) {
        // touch Events
        _addEventListeners(touchEvents[event], elem, callback);
    } else if (window.MouseEvent) {
        // mouse
        _addEventListeners(mouseEvents[event], elem, callback);
    }
}

const removeEventListener = (elem, event, callback) => {
    if (window.PointerEvent) {
        //pointer Events
        elem.removeEventListener(pointerEvents[event], callback);
    } else if (window.TouchEvent) {
        // touch Events
        elem.removeEventListener(touchEvents[event], callback);
    } if (window.MouseEvent) {
        // mouse
        elem.removeEventListener(mouseEvents[event], callback);
    }
}

export default {
    addEventListener,
    removeEventListener
};