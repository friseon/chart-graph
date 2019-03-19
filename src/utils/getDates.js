import constants from './constants';

const getDates = (data) => {
    const dates = data.columns.find(column => data.types[column[0]] === "x").slice(1);
    const formattedDates = dates.map(date => {
        const _date = new Date(date);
        return {
            short: `${constants.monthNames[_date.getMonth()]} ${_date.getDate()}`,
            long: `${constants.dayNames[_date.getDay()]}, ${constants.monthNames[_date.getMonth()]} ${_date.getDate()}`
        }
    });
    return formattedDates;
};

export default getDates;
