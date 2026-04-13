// 全局変數
let allData = [...enhancedData];
let filteredData = [...enhancedData];
let charts = {};

// 初始化儀表板
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // 更新時間
    updateTime();

    // 初始化下拉選單
    initializeSelects();

    // 初始化圖表
    initializeCharts();

    // 更新摘要卡片
    updateSummaryCards();

    // 更新數據表
    updateDataTable();

    // 更新圖例
    updateLegend();

    // 設置事件監聽
    setupEventListeners();

    // 檢查警示
    checkAlerts();
}

function initializeSelects() {
    const countySelect = document.getElementById('countySelect');
    const counties = [...new Set(allData.map(item => item.county))].sort();
    
    counties.forEach(county => {
        const option = document.createElement('option');
        option.value = county;
        option.textContent = county;
        countySelect.appendChild(option);
    });
}

function setupEventListeners() {
    document.getElementById('countySelect').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('sortBy').addEventListener('change', applyFilters);
}

function applyFilters() {
    const countySelect = document.getElementById('countySelect').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    // 複製原始數據
    filteredData = [...allData];

    // 應用縣市篩選
    if (countySelect) {
        filteredData = filteredData.filter(item => item.county === countySelect);
    }

    // 應用狀態篩選
    if (statusFilter) {
        filteredData = filteredData.filter(item => item.aqiLevel === statusFilter);
    }

    // 應用排序
    switch(sortBy) {
        case 'aqi-desc':
            filteredData.sort((a, b) => b.aqi - a.aqi);
            break;
        case 'aqi-asc':
            filteredData.sort((a, b) => a.aqi - b.aqi);
            break;
        case 'pm25-desc':
            filteredData.sort((a, b) => b.pm25 - a.pm25);
            break;
        case 'pm25-asc':
            filteredData.sort((a, b) => a.pm25 - b.pm25);
            break;
    }

    // 更新所有內容
    updateSummaryCards();
    updateDataTable();
    updateCharts();
    checkAlerts();
}

function updateSummaryCards() {
    const container = document.getElementById('summaryCards');
    container.innerHTML = '';

    // 如果篩選後沒有數據，顯示空狀態
    if (filteredData.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #9ca3af;">沒有符合條件的數據</p>';
        return;
    }

    filteredData.forEach(item => {
        const card = createCard(item);
        container.appendChild(card);
    });
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = `card ${item.aqiLevel}`;

    const aqiStatusClass = `status-${item.aqiLevel}`;
    const pm25StatusClass = `status-${item.pm25Level}`;

    let recommendationText = '';
    const aqiLevel = AQI_LEVELS[item.aqiLevel];
    
    if (item.aqiLevel === 'hazardous' || item.aqiLevel === 'veryUnhealthy') {
        recommendationText = '⚠️ 所有人應避免戶外活動';
    } else if (item.aqiLevel === 'unhealthy') {
        recommendationText = '⚠️ 敏感族群應留在室內';
    } else if (item.aqiLevel === 'unhealthySensitive') {
        recommendationText = '💡 敏感族群應減少戶外活動';
    }

    card.innerHTML = `
        <div class="card-title">${item.county}</div>
        <div class="card-value">${item.aqi}</div>
        <div class="card-status ${aqiStatusClass}">
            <strong>${item.aqiLevelCode}</strong> - ${item.aqiLevelName}
        </div>
        <div style="margin-top: 15px; font-size: 0.9em; color: #666;">
            <div><strong>PM2.5:</strong> ${item.pm25} µg/m³ 
                <span class="aqi-code ${item.pm25Level}">${item.pm25LevelCode}</span>
            </div>
            <div><strong>風速:</strong> ${item.windSpeed} m/s</div>
            <div><strong>濕度:</strong> ${item.humidity}%</div>
            <div><strong>溫度:</strong> ${item.temperature}°C</div>
        </div>
        ${recommendationText ? `<div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 5px; font-size: 0.9em;">${recommendationText}</div>` : ''}
    `;

    return card;
}

function updateDataTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    // 如果篩選後沒有數據，顯示空狀態
    if (filteredData.length === 0) {
        const row = tbody.insertRow();
        row.innerHTML = '<td colspan="9" style="text-align: center;">沒有符合條件的數據</td>';
        return;
    }

    filteredData.forEach(item => {
        const row = tbody.insertRow();
        
        // 查找最高值用於高亮
        const maxAqi = Math.max(...allData.map(d => d.aqi));
        const maxPm25 = Math.max(...allData.map(d => d.pm25));
        
        if (item.aqi === maxAqi || item.pm25 === maxPm25) {
            row.classList.add('highlight');
        }

        row.innerHTML = `
            <td><strong>${item.county}</strong></td>
            <td><strong>${item.aqi}</strong> ${item.aqi === maxAqi ? '🔴' : ''}</td>
            <td><span class="aqi-code ${item.aqiLevel}">${item.aqiLevelCode}</span> ${item.aqiLevelName}</td>
            <td><strong>${item.pm25}</strong> ${item.pm25 === maxPm25 ? '🔴' : ''}</td>
            <td><span class="aqi-code ${item.pm25Level}">${item.pm25LevelCode}</span> ${item.pm25LevelName}</td>
            <td>${getRecommendationEmoji(item.aqiLevel)}</td>
            <td>${item.windSpeed}</td>
            <td>${item.humidity}</td>
            <td>${item.temperature}</td>
        `;
    });
}

function getRecommendationEmoji(level) {
    const recommendations = {
        'good': '✅ 適合',
        'moderate': '⚠️ 適度',
        'unhealthySensitive': '⚠️ 敏感族群注意',
        'unhealthy': '🚫 不適合',
        'veryUnhealthy': '🚫 嚴禁',
        'hazardous': '🚫 危害'
    };
    return recommendations[level] || '';
}

function updateLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = '';

    Object.entries(AQI_LEVELS).forEach(([key, level]) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${level.color}; border: 1px solid #ccc;"></div>
            <div>
                <strong>${level.code}</strong> - ${level.name}<br>
                <span style="font-size: 0.85em; color: #666;">${level.description}</span>
            </div>
        `;
        legend.appendChild(item);
    });
}

function initializeCharts() {
    Chart.register(ChartDataLabels);
    
    // AQI 圖表
    const aqiCtx = document.getElementById('aqiChart').getContext('2d');
    const maxAqi = Math.max(...allData.map(d => d.aqi));
    const highlightIndex = allData.findIndex(d => d.aqi === maxAqi);
    
    const aqiColors = allData.map((item, idx) => idx === highlightIndex ? '#ff6b6b' : item.aqiColor);
    const aqiBorderColors = allData.map((item, idx) => idx === highlightIndex ? '#c92a2a' : item.aqiColor);

    charts.aqi = new Chart(aqiCtx, {
        type: 'bar',
        data: {
            labels: allData.map(item => item.county),
            datasets: [
                {
                    label: 'AQI 值',
                    data: allData.map(item => item.aqi),
                    backgroundColor: aqiColors,
                    borderColor: aqiBorderColors,
                    borderWidth: 2,
                    datalabels: {
                        anchor: 'top',
                        align: 'top',
                        display: true,
                        formatter: (value) => value,
                        color: '#333',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                {
                    type: 'line',
                    label: '正常基準線 (AQI = 50)',
                    data: new Array(allData.length).fill(50),
                    borderColor: '#10b981',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    datalabels: {
                        display: false
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                datalabels: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 350,
                    ticks: {
                        stepSize: 50
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });

    // PM2.5 圖表
    const pm25Ctx = document.getElementById('pm25Chart').getContext('2d');
    const maxPm25 = Math.max(...allData.map(d => d.pm25));
    const pm25HighlightIndex = allData.findIndex(d => d.pm25 === maxPm25);
    
    const pm25Colors = allData.map((item, idx) => idx === pm25HighlightIndex ? '#ff6b6b' : item.pm25Color);
    const pm25BorderColors = allData.map((item, idx) => idx === pm25HighlightIndex ? '#c92a2a' : item.pm25Color);

    charts.pm25 = new Chart(pm25Ctx, {
        type: 'bar',
        data: {
            labels: allData.map(item => item.county),
            datasets: [
                {
                    label: 'PM2.5 (µg/m³)',
                    data: allData.map(item => item.pm25),
                    backgroundColor: pm25Colors,
                    borderColor: pm25BorderColors,
                    borderWidth: 2,
                    datalabels: {
                        anchor: 'top',
                        align: 'top',
                        display: true,
                        formatter: (value) => value,
                        color: '#333',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                {
                    type: 'line',
                    label: '正常基準線 (PM2.5 = 35)',
                    data: new Array(allData.length).fill(35),
                    borderColor: '#10b981',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    datalabels: {
                        display: false
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                datalabels: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 120,
                    ticks: {
                        stepSize: 20
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });

    // 風速與 PM2.5 關係圖
    const windCtx = document.getElementById('windChart').getContext('2d');
    
    // 按風速排序
    const windSortedData = [...allData].sort((a, b) => b.windSpeed - a.windSpeed);

    charts.wind = new Chart(windCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: '風速 vs PM2.5',
                    data: allData.map(item => ({
                        x: item.windSpeed,
                        y: item.pm25,
                        county: item.county
                    })),
                    backgroundColor: allData.map(item => item.pm25Color),
                    borderColor: allData.map(item => item.pm25Color),
                    borderWidth: 2,
                    datalabels: {
                        display: false
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = context.raw;
                            return data.county + ': 風速 ' + data.x + ' m/s, PM2.5 ' + data.y + ' µg/m³';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '風速 (m/s)',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: 5
                },
                y: {
                    title: {
                        display: true,
                        text: 'PM2.5 (µg/m³)',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true
                }
            }
        }
    });

    // 空氣品質等級統計圖
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    
    const statusCounts = {
        good: allData.filter(d => d.aqiLevel === 'good').length,
        moderate: allData.filter(d => d.aqiLevel === 'moderate').length,
        unhealthySensitive: allData.filter(d => d.aqiLevel === 'unhealthySensitive').length,
        unhealthy: allData.filter(d => d.aqiLevel === 'unhealthy').length,
        veryUnhealthy: allData.filter(d => d.aqiLevel === 'veryUnhealthy').length,
        hazardous: allData.filter(d => d.aqiLevel === 'hazardous').length
    };

    const statusLabels = Object.keys(statusCounts).map(key => AQI_LEVELS[key].name);
    const statusValues = Object.values(statusCounts);
    const statusColors = Object.keys(statusCounts).map(key => AQI_LEVELS[key].color);

    charts.status = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: statusLabels,
            datasets: [
                {
                    data: statusValues,
                    backgroundColor: statusColors,
                    borderColor: '#fff',
                    borderWidth: 2,
                    datalabels: {
                        color: '#fff',
                        font: {
                            weight: 'bold'
                        },
                        formatter: (value, ctx) => {
                            const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = (value * 100 / sum).toFixed(0);
                            return value + ' (' + percentage + '%)';
                        }
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                datalabels: {
                    display: true
                }
            }
        }
    });
}

function updateCharts() {
    // 更新 AQI 圖表
    const maxAqi = Math.max(...allData.map(d => d.aqi));
    const aqiHighlightIndex = allData.findIndex(d => d.aqi === maxAqi);
    const aqiColors = allData.map((item, idx) => idx === aqiHighlightIndex ? '#ff6b6b' : item.aqiColor);
    
    if (charts.aqi) {
        charts.aqi.data.labels = allData.map(item => item.county);
        charts.aqi.data.datasets[0].data = allData.map(item => item.aqi);
        charts.aqi.data.datasets[0].backgroundColor = aqiColors;
        charts.aqi.update();
    }

    // 更新 PM2.5 圖表
    const maxPm25 = Math.max(...allData.map(d => d.pm25));
    const pm25HighlightIndex = allData.findIndex(d => d.pm25 === maxPm25);
    const pm25Colors = allData.map((item, idx) => idx === pm25HighlightIndex ? '#ff6b6b' : item.pm25Color);
    
    if (charts.pm25) {
        charts.pm25.data.labels = allData.map(item => item.county);
        charts.pm25.data.datasets[0].data = allData.map(item => item.pm25);
        charts.pm25.data.datasets[0].backgroundColor = pm25Colors;
        charts.pm25.update();
    }

    // 更新統計圖
    if (charts.status) {
        charts.status.update();
    }
}

function checkAlerts() {
    const alertBanner = document.getElementById('alertBanner');
    const alertCode = document.getElementById('alertCode');
    const alertMessage = document.getElementById('alertMessage');

    // 查找最嚴重的等級
    const severityOrder = ['hazardous', 'veryUnhealthy', 'unhealthy', 'unhealthySensitive', 'moderate', 'good'];
    let worstLevel = 'good';
    let worstItem = null;

    for (let level of severityOrder) {
        const found = filteredData.find(d => d.aqiLevel === level);
        if (found) {
            worstLevel = level;
            worstItem = found;
            break;
        }
    }

    if (worstLevel === 'good' || worstLevel === 'moderate') {
        alertBanner.classList.remove('show');
    } else {
        alertBanner.classList.add('show');
        const levelInfo = AQI_LEVELS[worstLevel];
        alertCode.textContent = levelInfo.code;
        alertMessage.textContent = `${worstItem.county} 的空氣品質為${levelInfo.name} - ${levelInfo.description}`;
    }

    // 更新統計信息
    updateStats();
}

function updateStats() {
    const avgAqi = Math.round(filteredData.reduce((a, b) => a + b.aqi, 0) / filteredData.length);
    const maxAqi = Math.max(...filteredData.map(d => d.aqi));
    const minAqi = Math.min(...filteredData.map(d => d.aqi));

    const avgPm25 = Math.round(filteredData.reduce((a, b) => a + b.pm25, 0) / filteredData.length);
    const maxPm25 = Math.max(...filteredData.map(d => d.pm25));
    const minPm25 = Math.min(...filteredData.map(d => d.pm25));

    document.getElementById('avgAqi').textContent = avgAqi;
    document.getElementById('maxAqi').textContent = maxAqi + ' 🔴';
    document.getElementById('minAqi').textContent = minAqi + ' 🟢';

    document.getElementById('avgPm25').textContent = avgPm25;
    document.getElementById('maxPm25').textContent = maxPm25 + ' 🔴';
    document.getElementById('minPm25').textContent = minPm25 + ' 🟢';
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-TW');
    document.getElementById('updateTime').textContent = timeString;
}

function resetFilters() {
    document.getElementById('countySelect').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('sortBy').value = 'aqi-desc';
    filteredData = [...allData];
    updateSummaryCards();
    updateDataTable();
    updateCharts();
    checkAlerts();
}

function downloadData() {
    // 準備 CSV 格式的數據
    let csv = 'county,aqi,aqi_level,pm25,pm25_level,wind_speed,humidity,temperature\n';
    
    filteredData.forEach(item => {
        csv += `${item.county},${item.aqi},${item.aqiLevelName},${item.pm25},${item.pm25LevelName},${item.windSpeed},${item.humidity},${item.temperature}\n`;
    });

    // 創建下載鏈接
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'air_quality_data_' + new Date().toISOString().slice(0, 10) + '.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}