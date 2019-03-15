const getDividers = (max) => {
    const _deviders = [];
    const _devidersAmount = 6;

    for (let i = 0; i < _devidersAmount; i++) {
        _deviders.push(Math.floor(max / _devidersAmount * i));
    }

    return _deviders.sort((a, b) => (a - b));
};

export default getDividers;
