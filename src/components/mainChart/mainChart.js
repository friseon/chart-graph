import {
    getDividers,
    constants
} from './../../utils';
import Chart from '../chart/chart';

class MainChart extends Chart {
    _prepareChartParams(data) {
        super._prepareChartParams(data);

        this.chartParams.deviders = getDividers(this.chartParams.max);
        this.chartParams.padding = {
            top: 10,
            bottom: 50
        };
    }

    draw() {
        super.draw();

        this._drawDividers();
        this._drawDates();
    }



    /**
     * Рисование горизонтальных разделителей
     */
    _drawDates() {
        const _dateDeviders = [];
        const _datesLength = this.chartParams.dates.length;
        const _maxDatesAmount = 6;
        let _dateDevidersAmount = _datesLength;
        let _dateStep = this.chartParams.step;

        // ограничение по кол-ву отображаемых дат
        if (_datesLength > _maxDatesAmount) {
            _dateDevidersAmount = _maxDatesAmount;
            _dateStep = this.width / (_maxDatesAmount - 1);
        }

        // выдёргиваем даты, которые будем отображать
        for (let i = 0; i < _dateDevidersAmount; i++) {
            const dateIndex = Math.round(_datesLength / _dateDevidersAmount * i);

            _dateDeviders.push(this.chartParams.dates[dateIndex]);
        }
        
        _dateDeviders.forEach((devider, index) => {
            const date = new Date(devider);
            let x = index * _dateStep;
            const y = this.height;

            this._startDraw();

            this.ctx.textAlign = "center";

            // смещаем текст у крайних точек
            if (index === 0) {
                x += 5;
                this.ctx.textAlign = "start";
            } else if (index === _dateDevidersAmount - 1) {
                x -= 5;
                this.ctx.textAlign = "end";
            }

            // this._startLine(x, y - this.chartParams.padding.bottom, '#f5f5f5', 0.5);
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#f5f5f5';
            this.ctx.fillText(`${constants.monthNames[date.getMonth()]} ${date.getDate()}`,
                x,
                y - this.chartParams.padding.bottom + 20);
            // this._drawLine(x, 0);
            this._endDraw();

            this.ctx.textAlign = "start";
        });
    }

    /**
     * Рисование горизонтальных разделителей
     */
    _drawDividers() {
        this.chartParams.deviders.forEach(devider => {
            const preparedValue = this._prepareValue(devider);

            this._startLine(0, preparedValue, '#f5f5f5', 0.5);
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#f5f5f5';
            this.ctx.fillText(devider, 5, preparedValue - 5);
            this._drawLine(this.width, preparedValue);
            this._endDraw();
        });
    }
}

export default MainChart;
