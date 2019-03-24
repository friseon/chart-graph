const getDividers = (max, min) => {
    const _dividers = [];
    const _dividersAmount = 4;
    const step = (max - min) / _dividersAmount;

    for (let i = 1; i <= _dividersAmount; i++) {
        if (i === 1) {
            _dividers.push(min);
        } if (i === _dividersAmount) {
            _dividers.push(Math.round(max * .98));
        } else {
            _dividers.push(min + Math.round(step) * i);
        }
    }

    return _dividers.sort((a, b) => (a - b));
};

export default getDividers;
