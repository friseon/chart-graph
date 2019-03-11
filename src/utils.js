export const getMax = (data) => {
    const full = data.reduce((arr, item) => {
        return arr.concat(item.data)
    }, []);

    return Math.max.apply(null, full);
};

export const getDates = (data) => {
    return data.columns.find(column => data.types[column[0]] === "x").slice(1);
};

export const prepareData = (data) => {
    const lines = data.columns.filter(column => data.types[column[0]] === "line");

    return lines.map(line => {
        const tag = line.shift();

        return {
            name: data.names[tag],
            color: data.colors[tag],
            data: line
        }
    });
};

export const getDividers = (max) => {
    const deviders = [];
    const devidersAmount = 6;

    for (let i = 0; i < devidersAmount; i++) {
        deviders.push(Math.floor(max / devidersAmount * i));
    }

    return deviders.sort((a, b) => (a - b));
};
