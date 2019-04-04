const pointerEvents = {
    chartstart: 'pointerdown',
    chartend: 'pointerup',
    start: 'pointerdown',
    move: 'pointermove',
    end: 'pointerup'
};

const touchEvents = {
    chartstart: 'touchstart',
    chartend: 'touchend',
    start: 'touchstart',
    move: 'touchmove',
    end: 'touchend'
};

const mouseEvents = {
    chartstart: 'mouseover',
    chartend: 'mouseout',
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
    if (window.MouseEvent) {
        // mouse
        _addEventListeners(mouseEvents[event], elem, callback);
    }

    if (window.PointerEvent) {
        //pointer Events
        _addEventListeners(pointerEvents[event], elem, callback, notPassive);
        if (elem !== document) {
            _addEventListeners('touchstart touchmove touchend', elem, (event) => { event.preventDefault()}, true);
        }
    } else if (window.TouchEvent) {
        // touch Events
        _addEventListeners(touchEvents[event], elem, callback);
    }
}

const removeEventListener = (elem, event, callback) => {
    if (window.MouseEvent) {
        // mouse
        elem.removeEventListener(mouseEvents[event], callback);
    }

    if (window.PointerEvent) {
        //pointer Events
        elem.removeEventListener(pointerEvents[event], callback);
    } else if (window.TouchEvent) {
        // touch Events
        elem.removeEventListener(touchEvents[event], callback);
    }
}

export default {
    addEventListener,
    removeEventListener
};