const getMax = (data) => {
    const full = data.reduce((arr, item) => {
        return arr.concat(item.data)
    }, []);

    return Math.max.apply(null, full);
};

export default getMax;
