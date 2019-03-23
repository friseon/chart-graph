const getDividers = (max, min) => {
    const _deviders = [];
    const _devidersAmount = 4;
    const step = (max - min) / _devidersAmount;

    for (let i = 1; i <= _devidersAmount; i++) {
        if (i === 1) {
            _deviders.push(min);
        } if (i === _devidersAmount) {
            _deviders.push(Math.round(max * .95));
        } else {
            _deviders.push(min + Math.round(step) * i);
        }
    }

    return _deviders.sort((a, b) => (a - b));
};

export default getDividers;
