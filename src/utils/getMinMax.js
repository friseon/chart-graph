const getMinMax = (data, params = {}) => {
    const full = data.reduce((arr, item) => {
        const start = params.start || 0;
        const end = params.end + 1 || item.data.length;

        if (params.filters && !params.filters[item.name]) {
            return arr;
        }

        return arr.concat(item.data.slice(start, end))
    }, []);

    return {
        min: Math.min.apply(null, full),
        max: Math.max.apply(null, full)
    };
};

export default getMinMax;
