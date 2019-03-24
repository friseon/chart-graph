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

const _addEventListeners = (types, elem, callback) => {
    types.split(' ').forEach(function (type) {
        elem.addEventListener(type, callback);
    }, this);
}

const addEventListener = (elem, event, callback) => {
    if (window.PointerEvent) {
        //pointer Events
        _addEventListeners(pointerEvents[event], elem, callback);
        _addEventListeners('touchstart touchmove touchend', elem, function(event) {
            // отключаем поведение для Touch Events
            event.preventDefault();
        });
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
    } else if (window.MouseEvent) {
        // mouse
        elem.removeEventListener(mouseEvents[event], callback);
    }
}

export default {
    addEventListener,
    removeEventListener
};