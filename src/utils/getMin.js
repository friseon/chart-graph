const getMin = (data, params = {}) => {
    const full = data.reduce((arr, item) => {
        const start = params.start || 0;
        const end = params.end + 1 || item.data.length;

        if (params.filters && !params.filters[item.name]) {
            return arr;
        }

        return arr.concat(item.data.slice(start, end))
    }, []);

    return Math.min.apply(null, full);
};

export default getMin;
