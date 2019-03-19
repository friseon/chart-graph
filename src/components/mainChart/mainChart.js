import {
    getDividers,
    constants
} from './../../utils';
import Chart from '../chart/chart';

class MainChart extends Chart {
    _prepareChartData(data) {
        super._prepareChartData(data);

        this.chartData.deviders = getDividers(this.chartData.max);
    }

    draw() {
        this._drawDividers();
        super.draw();
        this._drawDates();
    }

    /**
     * Рисование горизонтальных разделителей
     */
    _drawDates() {
        const _dateDeviders = [];
        const _datesLength = this.chartData.dates.length;
        const _maxDatesAmount = 6;
        let _dateDevidersAmount = _datesLength;
        let _dateStep = this.chartData.step;

        // ограничение по кол-ву отображаемых дат
        if (_datesLength > _maxDatesAmount) {
            _dateDevidersAmount = _maxDatesAmount;
            _dateStep = this.width / (_maxDatesAmount - 1);
        }

        // выдёргиваем даты, которые будем отображать
        for (let i = 0; i < _dateDevidersAmount; i++) {
            const dateIndex = Math.round(_datesLength / _dateDevidersAmount * i);

            _dateDeviders.push(this.chartData.dates[dateIndex]);
        }
        
        _dateDeviders.forEach((devider, index) => {
            const date = devider.short;
            let x = index * _dateStep;
            const y = this.height;

            this.ctx.textAlign = 'center';

            // смещаем текст у крайних точек
            if (index === 0) {
                x += 5;
                this.ctx.textAlign = 'start';
            } else if (index === _dateDevidersAmount - 1) {
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
        this.chartData.deviders.forEach(devider => {
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
