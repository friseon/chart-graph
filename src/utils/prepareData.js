 
const prepareData = (data) => {
    const lines = data.columns.filter(column => data.types[column[0]] === "line");

    return lines.map(line => {
        const _line = [...line];
        const _tag = _line.shift();

        return {
            name: data.names[_tag],
            color: data.colors[_tag],
            data: _line
        }
    });
};

export default prepareData;
