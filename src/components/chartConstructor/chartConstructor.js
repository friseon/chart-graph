import {
    prepareData,
    eventBuilder
} from '../../utils';

import {
    MainChart,
    SearchPanel,
    TogglerTheme
} from '../index';

import {
    chartColors,
    state
} from '../../config/config';

import './chartConstructor.scss';

class ChartConstructor {
    constructor(params) {
        this._chartId = Date.now();

        this.container = document.createElement('div');
        this.container.classList.add('chart-container');
        this.container.style.width = params.width + 'px';
        this.container.style.backgroundColor = chartColors.main[state.currentTheme];
        this.container.style.color = chartColors.text2[state.currentTheme];

        this.detailsPanel = document.createElement('div');
        this.detailsPanel.classList.add('details-panel');

        this.chartTitle = document.createElement('h2');
        this.chartTitle.classList.add('chart-title');
        this.chartTitle.innerHTML = params.title;

        this.container.appendChild(this.chartTitle);

        this.data = prepareData(params.data);

        eventBuilder.addEventListener(this.detailsPanel, 'start', this._onStartSearch.bind(this));

        this.mainChart = new MainChart({
            idCanvas: 'main-chart',
            data: this.data,
            container: this.detailsPanel,
            onUpdateData: this.onUpdateData,
            width: params.width - 24,
            height: params.height,
            paddings: {
                top: 10,
                bottom: 50
            }
        });
        this._createElementsForDetalization();

        this.container.appendChild(this.detailsPanel);

        this.searchPanel = new SearchPanel({
            data: this.data,
            container: this.container,
            width: params.width - 24,
            rangeHeight: Math.max(params.height / 4, 100),
            onUpdate: (params) => {
                this._hideDetalization();
                this.mainChart._updateCurrentData(params, true);
                this._prepareDetaisData({
                    dates: this.mainChart.currentChartState.dates,
                    lines: this.mainChart.currentChartState.cuttedData
                });
            }
        });

        this.toggler = new TogglerTheme({
            chartId: this._chartId,
            container: this.container,
            onChange: () => {
                this.searchPanel.updateTheme();
                this.mainChart.updateTheme();
                this.chartTitle.style.color = chartColors.text2[state.currentTheme];
                this.container.style.backgroundColor = chartColors.main[state.currentTheme];
                this.container.style.color = chartColors.text2[state.currentTheme];
                this.detailsPopup.style.backgroundColor = chartColors.main[state.currentTheme];
                this.detailsLine.style.backgroundColor = chartColors.line[state.currentTheme];
                document.querySelectorAll('.' + Array.from(this.pointMarker.classList).join('. ')).forEach(marker => {
                    marker.style.backgroundColor = chartColors.main[state.currentTheme];
                })
            }
        });

        document.querySelector('.chart').appendChild(this.container);
    }

    init() {
        this.searchPanel.init();
    }

    /**
     * Готовим данные для отображения popup
     * 
     * @param {Onject} data 
     */
    _prepareDetaisData(data) {
        const _items = data.dates.map(date => {
            return {
                date,
                values: []
            }
        });

        data.lines.forEach(line => {
            const item = this.popupLineDetails.cloneNode(true);
            item.style.color = line.color;
            item.id = line.name + this._chartId;

            const pointMarker = this.pointMarker.cloneNode(true);
            pointMarker.style.borderColor = line.color;
            pointMarker.id = 'point-marker-' + line.name + this._chartId;

            this.detailsPanel.appendChild(pointMarker);
            this.detailsPopup.querySelector('.details-popup__info').appendChild(item);

            line.data.forEach((value, index) => {
                const _temp = {
                    name: line.name,
                    value: value,
                    y: line.coords[index].y
                };

                _items[index].x = line.coords[index].x;
                _items[index].values.push(_temp);
            });
        });

        this.currentData = _items;
    }

    /**
     * Событие отображение popup
     */
    _onStartSearch() {
        const _onMoveLineMethod = (eventMove) => this._onLineMove.call(this, eventMove);

        const _onStopMoveLine = (e) => {
            eventBuilder.removeEventListener(this.detailsPanel, 'move', _onMoveLineMethod);
            eventBuilder.removeEventListener(document, 'end', _onStopMoveLine);

            this._onLineMove(e)
        }

        eventBuilder.addEventListener(this.detailsPanel, 'move', _onMoveLineMethod);
        eventBuilder.addEventListener(document, 'end', _onStopMoveLine);
    }

    /**
     * Движение курсора на графике
     * 
     * @param {Event} e 
     */
    _onLineMove(e) {
        const delta = this.mainChart.currentChartState.step / 2;

        const currentValue = this.currentData.find((item) => {
            const cursorX = e.pageX - this.detailsPanel.offsetLeft;

            return cursorX > (item.x - delta) && cursorX <= (item.x + delta);
        });

        if (currentValue) {
            if (this._popupHidden) {
                this._showDetalization();
            }

            const date = currentValue.date.long;
            this.detailsPopup.querySelector('.details-popup__date').textContent = date;

            currentValue.values.forEach(item => {
                this._setMarkerPosition(item.name, currentValue.x, item.y);

                document.getElementById(item.name + this._chartId).querySelector('.details-popup__line-name').textContent = item.name;
                document.getElementById(item.name + this._chartId).querySelector('.details-popup__line-value').textContent = item.value;
            });

            this._setLineAndPopupPosition(currentValue.x, e.layerY);
        }
    }

    /**
     * Отображение/перемещение маркеров
     * 
     * @param {String} name - имя графтка
     * @param {Number} x 
     * @param {Number} y 
     */
    _setMarkerPosition(name, x, y) {
        document.getElementById('point-marker-' + name + this._chartId).style.left = x + 'px';
        document.getElementById('point-marker-' + name + this._chartId).style.top = y + 'px'
    }

    /**
     * Перемещаем линию и popup
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    _setLineAndPopupPosition(x, y) {
        if (x + this.detailsPopup.offsetWidth >= this.mainChart.width) {
            this.detailsPopup.style.left = x - this.detailsPopup.offsetWidth - 18 + 'px';
        } else {
            this.detailsPopup.style.left = x + 'px';
        }

        if (y > this.mainChart.chartParams.paddings.bottom) {
            y = this.mainChart.chartParams.paddings.bottom;
        }

        if (y < 0) {
            y = 0;
        }

        this.detailsPopup.style.top = y + 'px';
        this.detailsLine.style.left = x + 'px';
    }

    /**
     * Создание элементов для отображениеинформации по точкам на графике
     */
    _createElementsForDetalization() {
        this.detailsLine = document.createElement('div');
        this.detailsLine.classList.add('details-line');
        this.detailsLine.style.bottom = this.mainChart.chartParams.paddings.bottom + 5 + 'px';

        this.detailsPopup = document.createElement('div');
        this.detailsPopup.classList.add('details-popup');
        this.detailsPopup.style.backgroundColor = chartColors.main[state.currentTheme];
        this.detailsLine.style.backgroundColor = chartColors.line[state.currentTheme];

        const popupDate = document.createElement('h3');
        popupDate.classList.add('details-popup__date');

        this.detailsPopupInfo = document.createElement('div');
        this.detailsPopupInfo.classList.add('details-popup__info');

        this.detailsPopup.appendChild(popupDate);
        this.detailsPopup.appendChild(this.detailsPopupInfo);

        this.pointMarker = document.createElement('div');
        this.pointMarker.classList.add('point-marker');
        this.pointMarker.style.backgroundColor = chartColors.main[state.currentTheme];

        this.popupLineDetails = document.createElement('div');
        this.popupLineDetails.classList.add('details-popup__line-info');

        const popupLineName = document.createElement('p');
        popupLineName.classList.add('details-popup__line-name');
        const popupLineValue = document.createElement('p');
        popupLineValue.classList.add('details-popup__line-value');

        this.popupLineDetails.appendChild(popupLineValue);
        this.popupLineDetails.appendChild(popupLineName);

        this.detailsPanel.appendChild(this.detailsLine);
        this.detailsPanel.appendChild(this.detailsPopup);
    }

    /**
     * Очистка popup
     */
    _clearPopupDetails() {
        this.detailsPopupInfo.innerHTML = '';
    }

    /**
     * Скрытие эелментов детализации
     */
    _hideDetalization() {
        this._popupHidden = true;
        this._clearPopupDetails();
        this.detailsPopup.style.display = 'none';
        this.detailsLine.style.display = 'none';
        this.detailsPanel.querySelectorAll('.point-marker').forEach(marker => {
            marker.remove();
        });
    }

    /**
     * Показ элементов детализации
     */
    _showDetalization() {
        this._popupHidden = false;
        this.detailsPopup.style.display = 'block';
        this.detailsLine.style.display = 'block';
        this.detailsPanel.querySelectorAll('.point-marker').forEach(marker => {
            marker.style.display = 'block';
        });
    }
}

export default ChartConstructor;
