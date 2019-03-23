import {
    getDividers,
    constants
} from './../../utils';
import Chart from '../chart/chart';

class MainChart extends Chart {
    _updateCurrentCoords(params) {
        if (!this._dateDeviders || !this._dateDeviders.length) {
            this._updateDateDeviders();
        }
        if (!this.currentChartData.deviders) {
            this.currentChartData.deviders = getDividers(this.currentChartData.max, this.currentChartData.min);
        }

        super._updateCurrentCoords(params);
    }

    updateCurrentCoords(params) {
        super.updateCurrentCoords(params);

        this._updateDateDeviders();
        this.currentChartData.deviders = getDividers(this.currentChartData.max, this.currentChartData.min);
    }

    _updateDateDeviders() {
        this._dateDeviders = [];
        const _currentDates = this.currentChartData.dates;
        const _datesLength = _currentDates.length - 1;
        const _maxDatesAmount = 6;
        this._dateDevidersAmount = _datesLength;
        this._dateStep = this.currentChartData.step;

        // ограничение по кол-ву отображаемых дат
        if (_datesLength > _maxDatesAmount) {
            this._dateDevidersAmount = _maxDatesAmount;
            this._dateStep = this.width / (_maxDatesAmount - 1);
        }

        // выдёргиваем даты, которые будем отображать
        for (let i = 0; i < this. _dateDevidersAmount; i++) {
            const dateIndex = Math.round(_datesLength / (this._dateDevidersAmount - 1)) * i;

            
            if (i === this._dateDevidersAmount - 1) {
                dateIndex= _datesLength;
            }

            this._dateDeviders.push(_currentDates[dateIndex]);
        }
    }

    draw() {
        super.draw();

        this._drawDates();
        this._drawDividers();
    }

    /**
     * Рисование горизонтальных разделителей
     */
    _drawDates() {
        this._dateDeviders.forEach((devider, index) => {
            const date = devider.short;
            let x = index * this._dateStep;
            const y = this.height;

            this.ctx.textAlign = 'center';

            // смещаем текст у крайних точек
            if (index === 0) {
                x += 5;
                this.ctx.textAlign = 'start';
            } else if (index === this._dateDevidersAmount - 1) {
                x -= 5;
                this.ctx.textAlign = 'end';
            }

            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#f5f5f5';
            this.ctx.fillText(date,
                x,
                y - this.chartParams.paddings.bottom + 20);

            this.ctx.textAlign = 'start';
        });
    }

    /**
     * Рисование горизонтальных разделителей
     */
    _drawDividers() {
        this.currentChartData.deviders.forEach(devider => {
            const preparedValue = this.getYFromPointValue(devider);

            this._startLine(0, preparedValue, this.lineColor, 1);
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#f5f5f5';
            this.ctx.fillText(devider, 5, preparedValue - 5);
            this._drawLine(this.width, preparedValue);
        });
    }
}

export default MainChart;
