class StateController {
    constructor(params) {
        this.theme = params.theme;
    }

    setNewData(data) {
        this._newData = data;
    }

    getCurrentData() {
        return this._currentData;
    }
}

export default StateController;
