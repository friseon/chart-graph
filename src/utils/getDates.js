const getDates = (data) => {
    return data.columns.find(column => data.types[column[0]] === "x").slice(1);
};

export default getDates;
