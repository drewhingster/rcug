// ============================================
// RCUG MEMBER PROGRESS DASHBOARD - CLOUDFLARE WORKER
// Rotaract Club of University of Guyana
// Rotary Year 2025-2026
// ============================================

export default {
  async fetch(request, env, ctx) {
    return new Response(HTML_CONTENT, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    });
  },
};

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RCUG Member Progress Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #ffffff;
            padding: 20px;
        }
        .container { max-width: 1600px; margin: 0 auto; }
        header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        header h1 {
            font-size: 2.5rem;
            background: linear-gradient(90deg, #f39c12, #e74c3c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        header p { color: #bdc3c7; font-size: 1.1rem; }
        .controls {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }
        .control-group { display: flex; flex-direction: column; gap: 5px; }
        .control-group label {
            font-size: 0.85rem;
            color: #bdc3c7;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        select, input {
            padding: 10px 15px;
            border: none;
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
            color: #fff;
            font-size: 1rem;
            cursor: pointer;
            min-width: 180px;
        }
        select:focus, input:focus { outline: 2px solid #f39c12; }
        select option { background: #1a1a2e; color: #fff; }
        .stats-bar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            backdrop-filter: blur(5px);
        }
        .stat-card h3 { font-size: 2rem; color: #f39c12; }
        .stat-card p { color: #bdc3c7; font-size: 0.9rem; margin-top: 5px; }
        .section-title {
            font-size: 1.5rem;
            margin: 30px 0 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f39c12;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .export-btn {
            background: linear-gradient(90deg, #27ae60, #2ecc71);
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            color: #fff;
            font-size: 0.9rem;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .export-btn:hover { transform: scale(1.05); }
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .member-card {
            background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border-radius: 15px;
            padding: 20px;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .member-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .member-card.good-standing { border-left: 4px solid #27ae60; }
        .member-card.not-good-standing { border-left: 4px solid #e74c3c; }
        .member-card.guest-card { border-left: 4px solid #3498db; }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .member-name { font-size: 1.3rem; font-weight: 600; }
        .member-badges { display: flex; flex-wrap: wrap; gap: 5px; }
        .badge {
            font-size: 0.7rem;
            padding: 3px 8px;
            border-radius: 12px;
            text-transform: uppercase;
            font-weight: 600;
        }
        .badge-member { background: #27ae60; }
        .badge-guest { background: #3498db; }
        .badge-new { background: linear-gradient(90deg, #9b59b6, #8e44ad); animation: pulse 2s infinite; }
        .badge-board { background: #f39c12; }
        .badge-terminated { background: #7f8c8d; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .member-details { font-size: 0.85rem; color: #bdc3c7; margin-bottom: 15px; }
        .member-details p { margin: 3px 0; }
        .member-details .committee-tag {
            display: inline-block;
            background: rgba(243, 156, 18, 0.3);
            padding: 2px 8px;
            border-radius: 4px;
            margin: 2px 2px 2px 0;
            font-size: 0.75rem;
            color: #f39c12;
        }
        .progress-section { margin-top: 15px; }
        .progress-item { margin-bottom: 12px; }
        .progress-label { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px; }
        .progress-bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
        .progress-fill.good { background: linear-gradient(90deg, #27ae60, #2ecc71); }
        .progress-fill.warning { background: linear-gradient(90deg, #f39c12, #e67e22); }
        .progress-fill.danger { background: linear-gradient(90deg, #e74c3c, #c0392b); }
        .checklist {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .checklist-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
        .checklist-item.completed { color: #27ae60; }
        .checklist-item.pending { color: #e74c3c; }
        .checklist-icon { font-size: 1rem; }
        .celebration-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .celebration-card {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .celebration-icon { font-size: 2rem; }
        .celebration-info h4 { font-size: 1rem; margin-bottom: 3px; }
        .celebration-info p { font-size: 0.85rem; color: #bdc3c7; }
        .no-data { text-align: center; padding: 40px; color: #7f8c8d; }
        .loading { text-align: center; padding: 60px; font-size: 1.2rem; color: #bdc3c7; }
        .error-message {
            background: rgba(231, 76, 60, 0.2);
            border: 1px solid #e74c3c;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
        }
        .debug-panel {
            background: rgba(0,0,0,0.5);
            border: 1px solid #f39c12;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 0.85rem;
            max-height: 300px;
            overflow-y: auto;
        }
        .debug-panel h4 { color: #f39c12; margin-bottom: 10px; }
        .debug-panel .success { color: #27ae60; }
        .debug-panel .error { color: #e74c3c; }
        .debug-panel .info { color: #3498db; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
            color: #fff;
            cursor: pointer;
            transition: all 0.3s;
        }
        .tab-btn.active { background: linear-gradient(90deg, #f39c12, #e74c3c); }
        .tab-btn:hover:not(.active) { background: rgba(255,255,255,0.2); }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .filter-pills { display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0; }
        .filter-pill {
            padding: 5px 12px;
            border-radius: 20px;
            background: rgba(255,255,255,0.1);
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s;
        }
        .filter-pill:hover, .filter-pill.active { background: #f39c12; }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            overflow: hidden;
        }
        .summary-table th, .summary-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .summary-table th {
            background: rgba(243, 156, 18, 0.2);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
        }
        .summary-table tr:hover { background: rgba(255,255,255,0.05); }
        @media (max-width: 768px) {
            header h1 { font-size: 1.8rem; }
            .cards-grid { grid-template-columns: 1fr; }
            .controls { flex-direction: column; align-items: stretch; }
            select, input { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔄 RCUG Member Progress Dashboard</h1>
            <p>Rotaract Club of University of Guyana | Rotary Year 2025-2026</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">Last Updated: <span id="lastUpdated">Loading...</span></p>
        </header>

        <!-- Debug Panel - Can be hidden in production -->
        <div class="debug-panel" id="debugPanel">
            <h4>🔧 Debug Console (Data Loading Status)</h4>
            <div id="debugLog"></div>
        </div>

        <div class="controls">
            <div class="control-group">
                <label>View Period</label>
                <select id="periodSelect">
                    <option value="Q1">Q1 (Jul-Sep)</option>
                    <option value="Q2" selected>Q2 (Oct-Dec)</option>
                    <option value="Q3">Q3 (Jan-Mar)</option>
                    <option value="Q4">Q4 (Apr-Jun)</option>
                    <option value="H1">H1 (Jul-Dec)</option>
                    <option value="H2">H2 (Jan-Jun)</option>
                    <option value="Annual">Annual</option>
                </select>
            </div>
            <div class="control-group">
                <label>Filter Status</label>
                <select id="statusFilter">
                    <option value="all">All Members</option>
                    <option value="good">Good Standing</option>
                    <option value="not-good">Needs Attention</option>
                    <option value="new">New Members</option>
                </select>
            </div>
            <div class="control-group">
                <label>Filter Committee</label>
                <select id="committeeFilter">
                    <option value="all">All Committees</option>
                    <option value="Club Service">Club Service</option>
                    <option value="Community Service">Community Service</option>
                    <option value="Finance">Finance</option>
                    <option value="International Service">International Service</option>
                    <option value="Professional Development">Professional Development</option>
                    <option value="Membership">Membership</option>
                    <option value="Public Image">Public Image</option>
                </select>
            </div>
            <div class="control-group">
                <label>Search</label>
                <input type="text" id="searchInput" placeholder="Search by name...">
            </div>
        </div>

        <div class="stats-bar" id="statsBar">
            <div class="stat-card"><h3 id="totalMembers">-</h3><p>Total Members</p></div>
            <div class="stat-card"><h3 id="goodStanding">-</h3><p>Good Standing</p></div>
            <div class="stat-card"><h3 id="needsAttention">-</h3><p>Needs Attention</p></div>
            <div class="stat-card"><h3 id="activeGuests">-</h3><p>Active Guests</p></div>
            <div class="stat-card"><h3 id="newMembers">-</h3><p>New Members (6mo)</p></div>
        </div>

        <div class="tabs">
            <button class="tab-btn active" data-tab="members">👥 Members</button>
            <button class="tab-btn" data-tab="guests">🎫 Guest Progress</button>
            <button class="tab-btn" data-tab="birthdays">🎂 Birthdays</button>
            <button class="tab-btn" data-tab="anniversaries">🎉 Induction Anniversaries</button>
            <button class="tab-btn" data-tab="summary">📊 Summary Table</button>
        </div>

        <div class="tab-content active" id="members-tab">
            <div class="section-title"><span>📋 Member Attendance & Standing</span></div>
            <div class="cards-grid" id="memberCards"><div class="loading">Loading member data...</div></div>
        </div>

        <div class="tab-content" id="guests-tab">
            <div class="section-title"><span>🎯 Guest Progress Toward Membership</span></div>
            <div class="cards-grid" id="guestCards"><div class="loading">Loading guest data...</div></div>
        </div>

        <div class="tab-content" id="birthdays-tab">
            <div class="section-title">
                <span>🎂 Member Birthdays</span>
                <button class="export-btn" onclick="exportBirthdays()">📤 Export for PI Chair</button>
            </div>
            <div class="filter-pills" id="birthdayMonthFilter">
                <span class="filter-pill active" data-month="all">All Months</span>
                <span class="filter-pill" data-month="1">Jan</span>
                <span class="filter-pill" data-month="2">Feb</span>
                <span class="filter-pill" data-month="3">Mar</span>
                <span class="filter-pill" data-month="4">Apr</span>
                <span class="filter-pill" data-month="5">May</span>
                <span class="filter-pill" data-month="6">Jun</span>
                <span class="filter-pill" data-month="7">Jul</span>
                <span class="filter-pill" data-month="8">Aug</span>
                <span class="filter-pill" data-month="9">Sep</span>
                <span class="filter-pill" data-month="10">Oct</span>
                <span class="filter-pill" data-month="11">Nov</span>
                <span class="filter-pill" data-month="12">Dec</span>
            </div>
            <div class="celebration-list" id="birthdayList"><div class="loading">Loading birthdays...</div></div>
        </div>

        <div class="tab-content" id="anniversaries-tab">
            <div class="section-title">
                <span>🎉 Induction Anniversaries</span>
                <button class="export-btn" onclick="exportAnniversaries()">📤 Export for PI Chair</button>
            </div>
            <div class="filter-pills" id="anniversaryMonthFilter">
                <span class="filter-pill active" data-month="all">All Months</span>
                <span class="filter-pill" data-month="1">Jan</span>
                <span class="filter-pill" data-month="2">Feb</span>
                <span class="filter-pill" data-month="3">Mar</span>
                <span class="filter-pill" data-month="4">Apr</span>
                <span class="filter-pill" data-month="5">May</span>
                <span class="filter-pill" data-month="6">Jun</span>
                <span class="filter-pill" data-month="7">Jul</span>
                <span class="filter-pill" data-month="8">Aug</span>
                <span class="filter-pill" data-month="9">Sep</span>
                <span class="filter-pill" data-month="10">Oct</span>
                <span class="filter-pill" data-month="11">Nov</span>
                <span class="filter-pill" data-month="12">Dec</span>
            </div>
            <div class="celebration-list" id="anniversaryList"><div class="loading">Loading anniversaries...</div></div>
        </div>

        <div class="tab-content" id="summary-tab">
            <div class="section-title">
                <span>📊 Attendance Summary Table</span>
                <button class="export-btn" onclick="exportSummary()">📤 Export CSV</button>
            </div>
            <table class="summary-table" id="summaryTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Committee</th>
                        <th>Business</th>
                        <th>Fellowship</th>
                        <th>Projects</th>
                        <th>Committee Mtgs</th>
                        <th>Overall %</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="summaryBody"></tbody>
            </table>
        </div>
    </div>

    <script>
        // ============================================
        // CONFIGURATION
        // ============================================
        // IMPORTANT: This is your ORIGINAL spreadsheet ID (not the published one)
        // Find it in your Google Sheet URL: https://docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
        const SPREADSHEET_ID = '1j0uOvYCe-DvOsPjxyb7RfLm7ddeB_LL99cJKeO40RaM';
        
        // GIDs for each sheet tab
        const MEMBER_REGISTRY_GID = '1821690489';
        const ALL_ATTENDANCE_GID = '1315129184';
        const GUEST_TRACKING_GID = '1284804990';
        const MEETING_SCHEDULE_GID = '1708148096';

        // ============================================
        // COMMITTEE ASSIGNMENTS
        // ============================================
        const COMMITTEE_ASSIGNMENTS = {
            'Adanna Edwards': ['Finance', 'Professional Development'],
            'Andrew Hing': ['Club Service', 'Finance', 'Membership'],
            'Asif Khan': ['Finance', 'International Service', 'Public Image'],
            'Christina Harris': ['Club Service', 'Professional Development', 'Membership'],
            'Christine Samuels': ['Club Service', 'Finance'],
            'Cliffia Rollox': ['Club Service', 'Community Service', 'Public Image'],
            'Darin Hall': ['Community Service'],
            'Dequan Wray': ['Club Service', 'Finance', 'Professional Development'],
            'Ganesh Anand': ['Community Service', 'International Service', 'Professional Development'],
            'Jaya Persaud': ['Community Service', 'International Service', 'Professional Development'],
            'Jemima Stephenson': ['International Service'],
            'Kadeem Bowen': ['Club Service'],
            'Liane Langford': [],
            'Mariah Lawrence': ['Club Service', 'Finance'],
            'Nandita Singh': ['Professional Development'],
            'Ngari Blair': ['Community Service', 'Finance', 'Professional Development'],
            'Omari London': ['Club Service', 'International Service', 'Professional Development'],
            'Ruth Manbodh': [],
            'Tishana Bheer': ['International Service', 'Professional Development'],
            'Vishal Roopnarine': [],
            'Yushina Ramlall': ['Finance', 'Public Image'],
            'Orletta John': ['Community Service', 'Membership', 'Public Image'],
            'Parmesh Ramgobin': ['Community Service', 'Professional Development'],
            'Renika Anand': ['Community Service', 'International Service'],
            'Tamara Bascom': ['Club Service', 'Community Service', 'International Service']
        };

        const BOARD_MEMBERS = [
            'Jemima Stephenson', 'Darin Hall', 'Ganesh Anand', 'Adanna Edwards',
            'Yushina Ramlall', 'Nandita Singh', 'Kadeem Bowen', 'Vishal Roopnarine', 'Andrew Hing'
        ];

        // ============================================
        // GLOBAL DATA
        // ============================================
        let memberData = [];
        let attendanceData = [];
        let guestData = [];
        let meetingSchedule = [];
        let currentPeriod = 'Q2';
        let currentBirthdayMonth = 'all';
        let currentAnniversaryMonth = 'all';

        // ============================================
        // DEBUG LOGGING
        // ============================================
        function debugLog(message, type = 'info') {
            const debugDiv = document.getElementById('debugLog');
            const time = new Date().toLocaleTimeString();
            debugDiv.innerHTML += '<div class="' + type + '">[' + time + '] ' + message + '</div>';
            console.log('[' + type.toUpperCase() + ']', message);
        }

        // ============================================
        // DATA FETCHING - Multiple methods
        // ============================================
        async function fetchSheetData(gid, sheetName) {
            debugLog('Fetching ' + sheetName + ' (GID: ' + gid + ')...', 'info');
            
            // Method 1: Try CSV export URL
            const csvUrl = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/export?format=csv&gid=' + gid;
            
            try {
                debugLog('Trying URL: ' + csvUrl, 'info');
                const response = await fetch(csvUrl);
                
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                }
                
                const text = await response.text();
                debugLog(sheetName + ' fetched! Size: ' + text.length + ' bytes', 'success');
                
                // Check if we got an error page instead of data
                if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
                    throw new Error('Got HTML instead of CSV - sheet may not be public');
                }
                
                const data = parseCSV(text);
                debugLog(sheetName + ' parsed: ' + data.length + ' rows', 'success');
                return data;
                
            } catch (error) {
                debugLog('Error fetching ' + sheetName + ': ' + error.message, 'error');
                return [];
            }
        }

        function parseCSV(text) {
            const lines = text.split('\\n');
            if (lines.length < 2) return [];
            
            const headers = parseCSVLine(lines[0]);
            debugLog('Headers found: ' + headers.slice(0, 5).join(', ') + '...', 'info');
            
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                const values = parseCSVLine(lines[i]);
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header.trim()] = values[index] ? values[index].trim() : '';
                });
                data.push(obj);
            }
            return data;
        }

        function parseCSVLine(line) {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current);
            return result;
        }

        // ============================================
        // INITIALIZATION
        // ============================================
        async function init() {
            document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
            debugLog('Dashboard initializing...', 'info');
            debugLog('Spreadsheet ID: ' + SPREADSHEET_ID, 'info');
            
            try {
                // Fetch all data
                const [members, attendance, guests, schedule] = await Promise.all([
                    fetchSheetData(MEMBER_REGISTRY_GID, 'Member Registry'),
                    fetchSheetData(ALL_ATTENDANCE_GID, 'All Attendance'),
                    fetchSheetData(GUEST_TRACKING_GID, 'Guest Tracking'),
                    fetchSheetData(MEETING_SCHEDULE_GID, 'Meeting Schedule')
                ]);
                
                memberData = processMembers(members);
                attendanceData = attendance;
                guestData = processGuests(guests);
                meetingSchedule = schedule;
                
                debugLog('Processed ' + memberData.length + ' members', 'success');
                debugLog('Processed ' + guestData.length + ' guests', 'success');
                
                if (memberData.length === 0) {
                    debugLog('WARNING: No member data loaded! Check sheet sharing settings.', 'error');
                }
                
                calculateMemberAttendance();
                setupEventListeners();
                renderAll();
                
                debugLog('Dashboard ready!', 'success');
                
            } catch (error) {
                debugLog('FATAL ERROR: ' + error.message, 'error');
                document.getElementById('memberCards').innerHTML = '<div class="error-message">Failed to load data. Check the debug panel above for details.</div>';
            }
        }

        // ============================================
        // DATA PROCESSING
        // ============================================
        function processMembers(rawData) {
            return rawData
                .filter(row => {
                    const name = row['Full Name'] || row['full name'] || row['Name'] || '';
                    return name && name !== 'Full Name' && !name.includes('MEMBER REGISTRY');
                })
                .map((row, index) => ({
                    id: index + 1,
                    name: row['Full Name'] || row['full name'] || row['Name'] || '',
                    firstName: row['First Name'] || row['first name'] || '',
                    lastName: row['Last Name'] || row['last name'] || '',
                    email: row['Email'] || row['Email Address'] || row['email'] || '',
                    contact: row['Contact'] || row['Contact Number'] || row['contact'] || '',
                    dob: row['Date of Birth'] || row['DOB'] || row['dob'] || '',
                    inducted: row['Date Inducted'] || row['Inducted'] || row['inducted'] || '',
                    status: row['Status'] || row['status'] || 'Active',
                    category: row['Category'] || row['category'] || 'Rotaractor'
                }));
        }

        function processGuests(rawData) {
            return rawData
                .filter(row => {
                    const name = row['First Name'] || row['first name'] || '';
                    return name && name !== 'First Name' && !name.includes('CLUB REGISTER');
                })
                .map(row => ({
                    name: ((row['First Name'] || '') + ' ' + (row['Last Name'] || '')).trim(),
                    firstName: row['First Name'] || '',
                    lastName: row['Last Name'] || '',
                    status: row['Status'] || 'NO ATTENDANCE',
                    meetingAttendance: parseInt(row['Total out of Six (Meetings)']) || 0,
                    totalMeetings: 6,
                    meetingPercentage: (parseFloat(row['% Total Meetings \\n(Req. 60%)']) || 0) * 100,
                    projectAttendance: parseInt(row['Total out of Five (Projects)']) || 0,
                    totalProjects: 5,
                    projectPercentage: (parseFloat(row['% Total Projects \\n(Req. 50%)']) || 0) * 100,
                    infoSession: row['Information Session'] === 'TRUE' || row['Information Session'] === true,
                    committeeMeeting: row['Committee Meeting'] === 'TRUE' || row['Committee Meeting'] === true,
                    ugStudent: row['Current or Graduate of UG'] === 'TRUE' || row['Current or Graduate of UG'] === true
                }));
        }

        function calculateMemberAttendance() {
            const period = currentPeriod;
            
            memberData.forEach(member => {
                const memberAttendance = attendanceData.filter(a => {
                    const fullName = a['Full Name'] || ((a['First Name'] || '') + ' ' + (a['Last Name'] || '')).trim();
                    const matchesName = fullName.toLowerCase() === member.name.toLowerCase();
                    const q = a['Quarter'] || '';
                    const matchesPeriod = period === 'Annual' || q === period || 
                                          (period === 'H1' && (q === 'Q1' || q === 'Q2')) ||
                                          (period === 'H2' && (q === 'Q3' || q === 'Q4'));
                    return matchesName && matchesPeriod;
                });
                
                const mt = 'Meeting Type';
                member.businessMeetings = memberAttendance.filter(a => a[mt] === 'Business Meeting').length;
                member.fellowshipMeetings = memberAttendance.filter(a => a[mt] === 'Fellowship Meeting').length;
                member.projects = memberAttendance.filter(a => a[mt] === 'Project').length;
                member.committeeMeetings = memberAttendance.filter(a => a[mt] && a[mt].includes('Committee Meeting')).length;
                
                member.totalBusinessMeetings = 2;
                member.totalFellowshipMeetings = 2;
                member.totalProjects = 5;
                
                const totalRegular = member.totalBusinessMeetings + member.totalFellowshipMeetings;
                const attendedRegular = member.businessMeetings + member.fellowshipMeetings;
                member.overallPercentage = totalRegular > 0 ? Math.round((attendedRegular / totalRegular) * 100) : 0;
            });
        }

        // ============================================
        // UTILITY FUNCTIONS
        // ============================================
        function calculateAge(dateString) {
            if (!dateString) return '-';
            const today = new Date();
            const birthDate = new Date(dateString);
            if (isNaN(birthDate.getTime())) return '-';
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
            return age;
        }

        function calculateYearsInducted(dateString) {
            if (!dateString) return 0;
            const today = new Date();
            const inductedDate = new Date(dateString);
            if (isNaN(inductedDate.getTime())) return 0;
            let years = today.getFullYear() - inductedDate.getFullYear();
            const monthDiff = today.getMonth() - inductedDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < inductedDate.getDate())) years--;
            return Math.max(0, years);
        }

        function isNewMember(inductedDate) {
            if (!inductedDate) return false;
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const inducted = new Date(inductedDate);
            return !isNaN(inducted.getTime()) && inducted > sixMonthsAgo;
        }

        function getProgressClass(percentage) {
            if (percentage >= 60) return 'good';
            if (percentage >= 40) return 'warning';
            return 'danger';
        }

        function isGoodStanding(member) {
            const isTerminated = member.status && member.status.toLowerCase().includes('terminated');
            return member.overallPercentage >= 60 && !isTerminated;
        }

        function getCommittees(name) { return COMMITTEE_ASSIGNMENTS[name] || []; }
        function isOnBoard(name) { return BOARD_MEMBERS.includes(name); }

        function formatFullDate(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }

        // ============================================
        // EVENT LISTENERS
        // ============================================
        function setupEventListeners() {
            document.getElementById('periodSelect').addEventListener('change', function(e) {
                currentPeriod = e.target.value;
                calculateMemberAttendance();
                renderAll();
            });

            document.getElementById('statusFilter').addEventListener('change', renderMembers);
            document.getElementById('committeeFilter').addEventListener('change', renderMembers);
            document.getElementById('searchInput').addEventListener('input', renderMembers);

            document.querySelectorAll('.tab-btn').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
                    document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
                    e.target.classList.add('active');
                    document.getElementById(e.target.dataset.tab + '-tab').classList.add('active');
                });
            });

            document.querySelectorAll('#birthdayMonthFilter .filter-pill').forEach(function(pill) {
                pill.addEventListener('click', function(e) {
                    document.querySelectorAll('#birthdayMonthFilter .filter-pill').forEach(function(p) { p.classList.remove('active'); });
                    e.target.classList.add('active');
                    currentBirthdayMonth = e.target.dataset.month;
                    renderBirthdays();
                });
            });

            document.querySelectorAll('#anniversaryMonthFilter .filter-pill').forEach(function(pill) {
                pill.addEventListener('click', function(e) {
                    document.querySelectorAll('#anniversaryMonthFilter .filter-pill').forEach(function(p) { p.classList.remove('active'); });
                    e.target.classList.add('active');
                    currentAnniversaryMonth = e.target.dataset.month;
                    renderAnniversaries();
                });
            });
        }

        // ============================================
        // RENDER FUNCTIONS
        // ============================================
        function renderAll() {
            updateStats();
            renderMembers();
            renderGuests();
            renderBirthdays();
            renderAnniversaries();
            renderSummaryTable();
        }

        function updateStats() {
            var activeMembers = memberData.filter(function(m) { return !m.status.toLowerCase().includes('terminated'); });
            var goodStandingCount = activeMembers.filter(function(m) { return isGoodStanding(m); }).length;
            var newMembersCount = activeMembers.filter(function(m) { return isNewMember(m.inducted); }).length;
            var activeGuestsCount = guestData.filter(function(g) { return g.status !== 'NO ATTENDANCE'; }).length;

            document.getElementById('totalMembers').textContent = activeMembers.length;
            document.getElementById('goodStanding').textContent = goodStandingCount;
            document.getElementById('needsAttention').textContent = activeMembers.length - goodStandingCount;
            document.getElementById('activeGuests').textContent = activeGuestsCount;
            document.getElementById('newMembers').textContent = newMembersCount;
        }

        function renderMembers() {
            var container = document.getElementById('memberCards');
            var statusFilter = document.getElementById('statusFilter').value;
            var committeeFilter = document.getElementById('committeeFilter').value;
            var searchTerm = document.getElementById('searchInput').value.toLowerCase();

            var filtered = memberData.filter(function(m) {
                if (searchTerm && m.name.toLowerCase().indexOf(searchTerm) === -1) return false;
                var isTerminated = m.status && m.status.toLowerCase().indexOf('terminated') !== -1;
                if (statusFilter === 'good' && (!isGoodStanding(m) || isTerminated)) return false;
                if (statusFilter === 'not-good' && (isGoodStanding(m) || isTerminated)) return false;
                if (statusFilter === 'new' && !isNewMember(m.inducted)) return false;
                if (committeeFilter !== 'all') {
                    var committees = getCommittees(m.name);
                    if (committees.indexOf(committeeFilter) === -1) return false;
                }
                return true;
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No members match the current filters</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(member) {
                var committees = getCommittees(member.name);
                var isNew = isNewMember(member.inducted);
                var onBoard = isOnBoard(member.name);
                var yearsInducted = calculateYearsInducted(member.inducted);
                var age = calculateAge(member.dob);
                var isTerminated = member.status && member.status.toLowerCase().indexOf('terminated') !== -1;
                var goodStanding = isGoodStanding(member);

                html += '<div class="member-card ' + (isTerminated ? '' : (goodStanding ? 'good-standing' : 'not-good-standing')) + '">';
                html += '<div class="card-header">';
                html += '<div class="member-name">' + member.name + '</div>';
                html += '<div class="member-badges">';
                html += isTerminated ? '<span class="badge badge-terminated">Terminated</span>' : '<span class="badge badge-member">Member</span>';
                if (isNew && !isTerminated) html += '<span class="badge badge-new">New</span>';
                if (onBoard && !isTerminated) html += '<span class="badge badge-board">Board</span>';
                html += '</div></div>';
                
                html += '<div class="member-details">';
                html += '<p>📧 ' + (member.email || '-') + '</p>';
                html += '<p>📱 ' + (member.contact || '-') + '</p>';
                html += '<p>🎂 Age: ' + age + ' | 🗓️ Member for ' + yearsInducted + ' year' + (yearsInducted !== 1 ? 's' : '') + '</p>';
                html += '<p>📅 Inducted: ' + formatFullDate(member.inducted) + '</p>';
                if (committees.length > 0) {
                    html += '<p>🏷️ ';
                    committees.forEach(function(c) { html += '<span class="committee-tag">' + c + '</span>'; });
                    html += '</p>';
                }
                html += '</div>';

                if (!isTerminated) {
                    html += '<div class="progress-section">';
                    html += '<div class="progress-item"><div class="progress-label"><span>Business Meetings</span><span>' + member.businessMeetings + '/' + member.totalBusinessMeetings + '</span></div>';
                    html += '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(member.businessMeetings/member.totalBusinessMeetings*100) + '" style="width: ' + Math.min(member.businessMeetings/member.totalBusinessMeetings*100, 100) + '%"></div></div></div>';
                    
                    html += '<div class="progress-item"><div class="progress-label"><span>Fellowship Meetings</span><span>' + member.fellowshipMeetings + '/' + member.totalFellowshipMeetings + '</span></div>';
                    html += '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(member.fellowshipMeetings/member.totalFellowshipMeetings*100) + '" style="width: ' + Math.min(member.fellowshipMeetings/member.totalFellowshipMeetings*100, 100) + '%"></div></div></div>';
                    
                    html += '<div class="progress-item"><div class="progress-label"><span>Projects</span><span>' + member.projects + '/' + member.totalProjects + '</span></div>';
                    html += '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(member.projects/member.totalProjects*100) + '" style="width: ' + Math.min(member.projects/member.totalProjects*100, 100) + '%"></div></div></div>';
                    
                    html += '<div class="progress-item"><div class="progress-label"><span>Committee Meetings</span><span>' + member.committeeMeetings + '</span></div>';
                    html += '<div class="progress-bar"><div class="progress-fill good" style="width: ' + (member.committeeMeetings > 0 ? '100' : '0') + '%"></div></div></div>';
                    
                    html += '<div class="progress-item"><div class="progress-label"><span>Overall Attendance (60% req.)</span><span>' + member.overallPercentage + '%</span></div>';
                    html += '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(member.overallPercentage) + '" style="width: ' + Math.min(member.overallPercentage, 100) + '%"></div></div></div>';
                    html += '</div>';
                } else {
                    html += '<p style="color: #7f8c8d; text-align: center; padding: 20px;">Member terminated - attendance not tracked</p>';
                }
                html += '</div>';
            });
            
            container.innerHTML = html;
        }

        function renderGuests() {
            var container = document.getElementById('guestCards');
            var searchTerm = document.getElementById('searchInput').value.toLowerCase();
            var memberNames = memberData.map(function(m) { return m.name.toLowerCase(); });
            
            var filtered = guestData.filter(function(g) {
                if (searchTerm && g.name.toLowerCase().indexOf(searchTerm) === -1) return false;
                if (memberNames.indexOf(g.name.toLowerCase()) !== -1) return false;
                return true;
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No guests found</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(guest) {
                var committees = getCommittees(guest.name);
                var meetingMet = guest.meetingPercentage >= 60;
                var projectMet = guest.projectPercentage >= 50;

                html += '<div class="member-card guest-card">';
                html += '<div class="card-header"><div class="member-name">' + guest.name + '</div>';
                html += '<div class="member-badges"><span class="badge badge-guest">Guest</span></div></div>';
                
                html += '<div class="member-details">';
                html += '<p>📊 Status: <strong>' + guest.status + '</strong></p>';
                html += guest.ugStudent ? '<p>🎓 UG Student/Graduate: ✅</p>' : '<p>🎓 UG Student/Graduate: ❌</p>';
                if (committees.length > 0) {
                    html += '<p>🏷️ ';
                    committees.forEach(function(c) { html += '<span class="committee-tag">' + c + '</span>'; });
                    html += '</p>';
                }
                html += '</div>';
                
                html += '<div class="progress-section">';
                html += '<div class="progress-item"><div class="progress-label"><span>Meeting Attendance (60% req.)</span><span>' + guest.meetingAttendance + '/' + guest.totalMeetings + ' (' + Math.round(guest.meetingPercentage) + '%)</span></div>';
                html += '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(guest.meetingPercentage) + '" style="width: ' + Math.min(guest.meetingPercentage, 100) + '%"></div></div></div>';
                
                html += '<div class="progress-item"><div class="progress-label"><span>Project Participation (50% req.)</span><span>' + guest.projectAttendance + '/' + guest.totalProjects + ' (' + Math.round(guest.projectPercentage) + '%)</span></div>';
                html += '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(guest.projectPercentage * 1.2) + '" style="width: ' + Math.min(guest.projectPercentage * 2, 100) + '%"></div></div></div>';
                html += '</div>';
                
                html += '<div class="checklist">';
                html += '<div class="checklist-item ' + (guest.infoSession ? 'completed' : 'pending') + '"><span class="checklist-icon">' + (guest.infoSession ? '✅' : '⬜') + '</span><span>Information Session</span></div>';
                html += '<div class="checklist-item ' + (guest.committeeMeeting ? 'completed' : 'pending') + '"><span class="checklist-icon">' + (guest.committeeMeeting ? '✅' : '⬜') + '</span><span>Committee Meeting</span></div>';
                html += '<div class="checklist-item ' + (meetingMet ? 'completed' : 'pending') + '"><span class="checklist-icon">' + (meetingMet ? '✅' : '⬜') + '</span><span>60% Meetings</span></div>';
                html += '<div class="checklist-item ' + (projectMet ? 'completed' : 'pending') + '"><span class="checklist-icon">' + (projectMet ? '✅' : '⬜') + '</span><span>50% Projects</span></div>';
                html += '</div></div>';
            });
            
            container.innerHTML = html;
        }

        function renderBirthdays() {
            var container = document.getElementById('birthdayList');
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var filtered = memberData.filter(function(m) {
                if (!m.dob) return false;
                var isTerminated = m.status && m.status.toLowerCase().indexOf('terminated') !== -1;
                if (isTerminated) return false;
                var date = new Date(m.dob);
                if (isNaN(date.getTime())) return false;
                if (currentBirthdayMonth === 'all') return true;
                return date.getMonth() + 1 === parseInt(currentBirthdayMonth);
            });

            filtered.sort(function(a, b) {
                var dateA = new Date(a.dob);
                var dateB = new Date(b.dob);
                if (dateA.getMonth() !== dateB.getMonth()) return dateA.getMonth() - dateB.getMonth();
                return dateA.getDate() - dateB.getDate();
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No birthdays found for this filter</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(member) {
                var dob = new Date(member.dob);
                var age = calculateAge(member.dob);
                html += '<div class="celebration-card"><div class="celebration-icon">🎂</div><div class="celebration-info"><h4>' + member.name + '</h4><p>' + monthNames[dob.getMonth() + 1] + ' ' + dob.getDate() + ' • Turning ' + (age + 1) + '</p></div></div>';
            });
            container.innerHTML = html;
        }

        function renderAnniversaries() {
            var container = document.getElementById('anniversaryList');
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var filtered = memberData.filter(function(m) {
                if (!m.inducted) return false;
                var isTerminated = m.status && m.status.toLowerCase().indexOf('terminated') !== -1;
                if (isTerminated) return false;
                var date = new Date(m.inducted);
                if (isNaN(date.getTime())) return false;
                if (currentAnniversaryMonth === 'all') return true;
                return date.getMonth() + 1 === parseInt(currentAnniversaryMonth);
            });

            filtered.sort(function(a, b) {
                var dateA = new Date(a.inducted);
                var dateB = new Date(b.inducted);
                if (dateA.getMonth() !== dateB.getMonth()) return dateA.getMonth() - dateB.getMonth();
                return dateA.getDate() - dateB.getDate();
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No induction anniversaries found for this filter</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(member) {
                var inducted = new Date(member.inducted);
                var years = calculateYearsInducted(member.inducted);
                html += '<div class="celebration-card"><div class="celebration-icon">🎉</div><div class="celebration-info"><h4>' + member.name + '</h4><p>' + monthNames[inducted.getMonth() + 1] + ' ' + inducted.getDate() + ' • ' + (years + 1) + ' year' + (years !== 0 ? 's' : '') + ' in RCUG</p></div></div>';
            });
            container.innerHTML = html;
        }

        function renderSummaryTable() {
            var tbody = document.getElementById('summaryBody');
            var activeMembers = memberData.filter(function(m) { return !(m.status && m.status.toLowerCase().indexOf('terminated') !== -1); });

            var html = '';
            activeMembers.forEach(function(member) {
                var committees = getCommittees(member.name);
                var goodStanding = isGoodStanding(member);
                html += '<tr><td>' + member.name + '</td><td>' + (committees.join(', ') || '-') + '</td><td>' + member.businessMeetings + '/' + member.totalBusinessMeetings + '</td><td>' + member.fellowshipMeetings + '/' + member.totalFellowshipMeetings + '</td><td>' + member.projects + '/' + member.totalProjects + '</td><td>' + (member.committeeMeetings || 0) + '</td><td>' + member.overallPercentage + '%</td><td style="color: ' + (goodStanding ? '#27ae60' : '#e74c3c') + '">' + (goodStanding ? '✅ Good' : '⚠️ Check') + '</td></tr>';
            });
            tbody.innerHTML = html;
        }

        // ============================================
        // EXPORT FUNCTIONS
        // ============================================
        function exportBirthdays() {
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var data = memberData
                .filter(function(m) { return m.dob && !(m.status && m.status.toLowerCase().indexOf('terminated') !== -1); })
                .filter(function(m) { var d = new Date(m.dob); return !isNaN(d.getTime()) && (currentBirthdayMonth === 'all' || d.getMonth() + 1 === parseInt(currentBirthdayMonth)); })
                .map(function(m) { var dob = new Date(m.dob); return { Name: m.name, Month: monthNames[dob.getMonth() + 1], Day: dob.getDate(), 'Turning Age': calculateAge(m.dob) + 1 }; });
            downloadCSV(data, 'RCUG_Birthdays.csv');
        }

        function exportAnniversaries() {
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var data = memberData
                .filter(function(m) { return m.inducted && !(m.status && m.status.toLowerCase().indexOf('terminated') !== -1); })
                .filter(function(m) { var d = new Date(m.inducted); return !isNaN(d.getTime()) && (currentAnniversaryMonth === 'all' || d.getMonth() + 1 === parseInt(currentAnniversaryMonth)); })
                .map(function(m) { var inducted = new Date(m.inducted); return { Name: m.name, Month: monthNames[inducted.getMonth() + 1], Day: inducted.getDate(), 'Years in RCUG': calculateYearsInducted(m.inducted) + 1 }; });
            downloadCSV(data, 'RCUG_Anniversaries.csv');
        }

        function exportSummary() {
            var activeMembers = memberData.filter(function(m) { return !(m.status && m.status.toLowerCase().indexOf('terminated') !== -1); });
            var data = activeMembers.map(function(m) {
                return {
                    Name: m.name, Committee: getCommittees(m.name).join('; ') || '-',
                    'Business Meetings': m.businessMeetings + '/' + m.totalBusinessMeetings,
                    'Fellowship Meetings': m.fellowshipMeetings + '/' + m.totalFellowshipMeetings,
                    Projects: m.projects + '/' + m.totalProjects,
                    'Committee Meetings': m.committeeMeetings || 0,
                    'Overall %': m.overallPercentage + '%',
                    Status: isGoodStanding(m) ? 'Good Standing' : 'Needs Attention'
                };
            });
            downloadCSV(data, 'RCUG_Attendance_Summary_' + currentPeriod + '.csv');
        }

        function downloadCSV(data, filename) {
            if (data.length === 0) { alert('No data to export'); return; }
            var headers = Object.keys(data[0]);
            var csv = headers.join(',') + '\\n';
            data.forEach(function(row) {
                csv += headers.map(function(h) { return '"' + row[h] + '"'; }).join(',') + '\\n';
            });
            var blob = new Blob([csv], { type: 'text/csv' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>`;
