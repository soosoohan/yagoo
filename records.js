// records.js - 4가지 모드별 기록 관리 시스템

class RecordsManager {
constructor() {
this.allRecords = this.loadAllRecords();
}


// 모든 모드의 기록 불러오기
loadAllRecords() {
    const saved = localStorage.getItem('baseballRecordsMultiMode');
    return saved ? JSON.parse(saved) : {
        m3e: [], // 3자리 0제외
        m3i: [], // 3자리 0포함
        m4e: [], // 4자리 0제외
        m4i: []  // 4자리 0포함
    };
}

// 모든 기록 저장하기
saveAllRecords() {
    localStorage.setItem('baseballRecordsMultiMode', JSON.stringify(this.allRecords));
    console.log('기록이 저장되었습니다:', this.allRecords);
}

// 특정 모드의 기록 가져오기
getRecords(modeKey) {
    return this.allRecords[modeKey] || [];
}

// 신기록 확인 및 추가
addRecord(modeKey, attempts) {
    if (!this.allRecords[modeKey]) {
        this.allRecords[modeKey] = [];
    }

    const records = this.allRecords[modeKey];
    
    // 기록을 시도 횟수 기준으로 정렬 (오름차순)
    records.sort((a, b) => a.attempts - b.attempts);
    
    const newRecord = {
        attempts: attempts,
        date: new Date().toLocaleDateString('ko-KR'),
        timestamp: Date.now()
    };

    // 10등 이내 기록인지 확인
    if (records.length < 10 || attempts < records[9]?.attempts) {
        records.push(newRecord);
        records.sort((a, b) => a.attempts - b.attempts);
        
        // 10등까지만 유지
        if (records.length > 10) {
            records.splice(10);
        }
        
        this.saveAllRecords();
        
        const rank = records.findIndex(r => 
            r.attempts === attempts && r.timestamp === newRecord.timestamp
        ) + 1;
        
        return { isNewRecord: true, rank: rank };
    }
    
    return { isNewRecord: false };
}

// 특정 모드의 통계 정보 생성
getStatistics(modeKey) {
    const records = this.getRecords(modeKey);
    
    if (records.length === 0) {
        return {
            totalRecords: 0,
            bestRecord: 0,
            averageAttempts: 0,
            recentRecord: '-'
        };
    }

    const attempts = records.map(r => r.attempts);
    return {
        totalRecords: records.length,
        bestRecord: Math.min(...attempts),
        averageAttempts: (attempts.reduce((a, b) => a + b, 0) / attempts.length).toFixed(1),
        recentRecord: records[records.length - 1].date
    };
}

// 특정 모드의 랭킹 조회
getRanking(modeKey) {
    const records = this.getRecords(modeKey);
    return records.map((record, index) => ({
        rank: index + 1,
        attempts: record.attempts,
        date: record.date
    }));
}

// 전체 통계 (모든 모드 통합)
getAllStatistics() {
    const modeNames = {
        m3e: "3자리 0제외",
        m3i: "3자리 0포함", 
        m4e: "4자리 0제외",
        m4i: "4자리 0포함"
    };

    let totalGames = 0;
    let allAttempts = [];
    let modeStats = {};

    Object.keys(this.allRecords).forEach(modeKey => {
        const records = this.getRecords(modeKey);
        const stats = this.getStatistics(modeKey);
        
        modeStats[modeKey] = {
            name: modeNames[modeKey],
            ...stats
        };

        totalGames += records.length;
        allAttempts.push(...records.map(r => r.attempts));
    });

    return {
        totalGames,
        overallAverage: allAttempts.length > 0 ? 
            (allAttempts.reduce((a, b) => a + b, 0) / allAttempts.length).toFixed(1) : 0,
        modeStats
    };
}

// 최근 기록들 (모든 모드에서 최근 10개)
getRecentRecords(limit = 10) {
    let allRecords = [];
    
    Object.keys(this.allRecords).forEach(modeKey => {
        const records = this.getRecords(modeKey);
        records.forEach(record => {
            allRecords.push({
                ...record,
                mode: modeKey,
                modeName: this.getModeLabel(modeKey)
            });
        });
    });

    // 타임스탬프 기준으로 최신순 정렬
    allRecords.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    return allRecords.slice(0, limit);
}

// 모드 라벨 가져오기
getModeLabel(modeKey) {
    const labels = {
        m3e: "3자리 0제외",
        m3i: "3자리 0포함", 
        m4e: "4자리 0제외",
        m4i: "4자리 0포함"
    };
    return labels[modeKey] || modeKey;
}

// 월별 통계 (모든 모드 통합)
getMonthlyStats() {
    const monthCount = {};
    
    Object.keys(this.allRecords).forEach(modeKey => {
        const records = this.getRecords(modeKey);
        records.forEach(record => {
            const yearMonth = record.date.includes('.') ? 
                record.date.split('.').slice(0, 2).join('.') : 
                record.date.substring(0, 7);
            monthCount[yearMonth] = (monthCount[yearMonth] || 0) + 1;
        });
    });
    
    return monthCount;
}

}

// 전역 인스턴스 생성
const recordsManager = new RecordsManager();
