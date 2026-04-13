// 空氣品質警示等級定義
const AQI_LEVELS = {
    good: { min: 0, max: 50, name: '良好', code: 'G', color: '#10b981', description: '空氣品質良好，可正常進行戶外活動' },
    moderate: { min: 51, max: 100, name: '中等', code: 'M', color: '#f59e0b', description: '空氣品質中等，敏感族群應考慮減少戶外活動' },
    unhealthySensitive: { min: 101, max: 150, name: '對敏感族群不健康', code: 'U-S', color: '#f97316', description: '敏感族群應避免戶外活動，一般民眾可正常活動' },
    unhealthy: { min: 151, max: 200, name: '不健康', code: 'U', color: '#ef4444', description: '應避免戶外活動，敏感族群應留在室內' },
    veryUnhealthy: { min: 201, max: 300, name: '非常不健康', code: 'V-U', color: '#7c3aed', description: '所有人都應避免戶外活動' },
    hazardous: { min: 301, max: 500, name: '危害', code: 'H', color: '#7f1d1d', description: '危險等級，應留在室內並避免外出' }
};

// PM2.5 警示等級定義
const PM25_LEVELS = {
    good: { min: 0, max: 35, name: '良好', code: 'G', color: '#10b981' },
    moderate: { min: 36, max: 75, name: '中等', code: 'M', color: '#f59e0b' },
    unhealthySensitive: { min: 76, max: 115, name: '對敏感族群不健康', code: 'U-S', color: '#f97316' },
    unhealthy: { min: 116, max: 155, name: '不健康', code: 'U', color: '#ef4444' },
    veryUnhealthy: { min: 156, max: 250, name: '非常不健康', code: 'V-U', color: '#7c3aed' },
    hazardous: { min: 251, max: 500, name: '危害', code: 'H', color: '#7f1d1d' }
};

// 台灣各縣市空氣品質數據 (示例數據)
const airQualityData = [
    { county: '台北市', aqi: 72, pm25: 28, windSpeed: 2.5, humidity: 65, temperature: 22 },
    { county: '新北市', aqi: 68, pm25: 26, windSpeed: 2.3, humidity: 68, temperature: 21 },
    { county: '基隆市', aqi: 55, pm25: 18, windSpeed: 3.2, humidity: 72, temperature: 19 },
    { county: '桃園市', aqi: 85, pm25: 35, windSpeed: 2.1, humidity: 62, temperature: 23 },
    { county: '新竹市', aqi: 78, pm25: 32, windSpeed: 2.8, humidity: 59, temperature: 24 },
    { county: '新竹縣', aqi: 82, pm25: 34, windSpeed: 2.4, humidity: 61, temperature: 23 },
    { county: '苗栗縣', aqi: 95, pm25: 45, windSpeed: 1.9, humidity: 58, temperature: 24 },
    { county: '台中市', aqi: 125, pm25: 68, windSpeed: 1.5, humidity: 55, temperature: 25 },
    { county: '彰化縣', aqi: 142, pm25: 82, windSpeed: 1.2, humidity: 52, temperature: 26 },
    { county: '南投縣', aqi: 105, pm25: 52, windSpeed: 1.8, humidity: 60, temperature: 24 },
    { county: '雲林縣', aqi: 148, pm25: 85, windSpeed: 1.1, humidity: 50, temperature: 27 },
    { county: '嘉義縣', aqi: 138, pm25: 78, windSpeed: 1.3, humidity: 51, temperature: 26 },
    { county: '嘉義市', aqi: 132, pm25: 75, windSpeed: 1.4, humidity: 53, temperature: 25 },
    { county: '台南市', aqi: 152, pm25: 92, windSpeed: 0.9, humidity: 48, temperature: 28 },
    { county: '高雄市', aqi: 168, pm25: 105, windSpeed: 0.8, humidity: 45, temperature: 29 },
    { county: '屏東縣', aqi: 135, pm25: 76, windSpeed: 1.6, humidity: 54, temperature: 26 },
    { county: '宜蘭縣', aqi: 48, pm25: 15, windSpeed: 3.8, humidity: 75, temperature: 18 },
    { county: '花蓮縣', aqi: 52, pm25: 17, windSpeed: 3.5, humidity: 70, temperature: 20 },
    { county: '台東縣', aqi: 58, pm25: 20, windSpeed: 3.2, humidity: 68, temperature: 21 },
    { county: '澎湖縣', aqi: 62, pm25: 22, windSpeed: 4.2, humidity: 76, temperature: 19 },
    { county: '金門縣', aqi: 88, pm25: 38, windSpeed: 3.1, humidity: 72, temperature: 20 },
    { county: '連江縣', aqi: 45, pm25: 12, windSpeed: 4.5, humidity: 78, temperature: 17 }
];

// 獲取AQI等級
function getAQILevel(aqi) {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthySensitive';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'veryUnhealthy';
    return 'hazardous';
}

// 獲取PM2.5等級
function getPM25Level(pm25) {
    if (pm25 <= 35) return 'good';
    if (pm25 <= 75) return 'moderate';
    if (pm25 <= 115) return 'unhealthySensitive';
    if (pm25 <= 155) return 'unhealthy';
    if (pm25 <= 250) return 'veryUnhealthy';
    return 'hazardous';
}

// 增強數據 - 添加等級信息
const enhancedData = airQualityData.map(item => ({
    ...item,
    aqiLevel: getAQILevel(item.aqi),
    aqiLevelName: AQI_LEVELS[getAQILevel(item.aqi)].name,
    aqiLevelCode: AQI_LEVELS[getAQILevel(item.aqi)].code,
    aqiColor: AQI_LEVELS[getAQILevel(item.aqi)].color,
    pm25Level: getPM25Level(item.pm25),
    pm25LevelName: PM25_LEVELS[getPM25Level(item.pm25)].name,
    pm25LevelCode: PM25_LEVELS[getPM25Level(item.pm25)].code,
    pm25Color: PM25_LEVELS[getPM25Level(item.pm25)].color
}));