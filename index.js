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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #ffffff;
            padding: 20px;
        }
        .container {
            max-width: 1600px;
            margin: 0 auto;
        }
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
        header p {
            color: #bdc3c7;
            font-size: 1.1rem;
        }
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
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
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
        select:focus, input:focus {
            outline: 2px solid #f39c12;
        }
        select option {
            background: #1a1a2e;
            color: #fff;
        }
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
        .stat-card h3 {
            font-size: 2rem;
            color: #f39c12;
        }
        .stat-card p {
            color: #bdc3c7;
            font-size: 0.9rem;
            margin-top: 5px;
        }
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
        .export-btn:hover {
            transform: scale(1.05);
        }
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
        .member-card.good-standing {
            border-left: 4px solid #27ae60;
        }
        .member-card.not-good-standing {
            border-left: 4px solid #e74c3c;
        }
        .member-card.guest-card {
            border-left: 4px solid #3498db;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .member-name {
            font-size: 1.3rem;
            font-weight: 600;
        }
        .member-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .badge {
            font-size: 0.7rem;
            padding: 3px 8px;
            border-radius: 12px;
            text-transform: uppercase;
            font-weight: 600;
        }
        .badge-member {
            background: #27ae60;
        }
        .badge-guest {
            background: #3498db;
        }
        .badge-new {
            background: linear-gradient(90deg, #9b59b6, #8e44ad);
            animation: pulse 2s infinite;
        }
        .badge-board {
            background: #f39c12;
        }
        .badge-terminated {
            background: #7f8c8d;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .member-details {
            font-size: 0.85rem;
            color: #bdc3c7;
            margin-bottom: 15px;
        }
        .member-details p {
            margin: 3px 0;
        }
        .member-details .committee-tag {
            display: inline-block;
            background: rgba(243, 156, 18, 0.3);
            padding: 2px 8px;
            border-radius: 4px;
            margin: 2px 2px 2px 0;
            font-size: 0.75rem;
            color: #f39c12;
        }
        .progress-section {
            margin-top: 15px;
        }
        .progress-item {
            margin-bottom: 12px;
        }
        .progress-label {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            margin-bottom: 5px;
        }
        .progress-bar {
            height: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.5s ease;
        }
        .progress-fill.good {
            background: linear-gradient(90deg, #27ae60, #2ecc71);
        }
        .progress-fill.warning {
            background: linear-gradient(90deg, #f39c12, #e67e22);
        }
        .progress-fill.danger {
            background: linear-gradient(90deg, #e74c3c, #c0392b);
        }
        .checklist {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .checklist-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
        }
        .checklist-item.completed {
            color: #27ae60;
        }
        .checklist-item.pending {
            color: #e74c3c;
        }
        .checklist-icon {
            font-size: 1rem;
        }
        .birthday-section, .anniversary-section {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
        }
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
        .celebration-icon {
            font-size: 2rem;
        }
        .celebration-info h4 {
            font-size: 1rem;
            margin-bottom: 3px;
        }
        .celebration-info p {
            font-size: 0.85rem;
            color: #bdc3c7;
        }
        .no-data {
            text-align: center;
            padding: 40px;
            color: #7f8c8d;
        }
        .loading {
            text-align: center;
            padding: 60px;
            font-size: 1.2rem;
            color: #bdc3c7;
        }
        .loading::after {
            content: '';
            animation: dots 1.5s infinite;
        }
        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
        }
        .error-message {
            background: rgba(231, 76, 60, 0.2);
            border: 1px solid #e74c3c;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
        }
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .tab-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
            color: #fff;
            cursor: pointer;
            transition: all 0.3s;
        }
        .tab-btn.active {
            background: linear-gradient(90deg, #f39c12, #e74c3c);
        }
        .tab-btn:hover:not(.active) {
            background: rgba(255,255,255,0.2);
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .filter-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 15px 0;
        }
        .filter-pill {
            padding: 5px 12px;
            border-radius: 20px;
            background: rgba(255,255,255,0.1);
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s;
        }
        .filter-pill:hover, .filter-pill.active {
            background: #f39c12;
        }
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
        .summary-table tr:hover {
            background: rgba(255,255,255,0.05);
        }
        @media (max-width: 768px) {
            header h1 {
                font-size: 1.8rem;
            }
            .cards-grid {
                grid-template-columns: 1fr;
            }
            .controls {
                flex-direction: column;
                align-items: stretch;
            }
            select, input {
                width: 100%;
            }
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
            <div class="stat-card">
                <h3 id="totalMembers">-</h3>
                <p>Total Members</p>
            </div>
            <div class="stat-card">
                <h3 id="goodStanding">-</h3>
                <p>Good Standing</p>
            </div>
            <div class="stat-card">
                <h3 id="needsAttention">-</h3>
                <p>Needs Attention</p>
            </div>
            <div class="stat-card">
                <h3 id="activeGuests">-</h3>
                <p>Active Guests</p>
            </div>
            <div class="stat-card">
                <h3 id="newMembers">-</h3>
                <p>New Members (6mo)</p>
            </div>
        </div>

        <div class="tabs">
            <button class="tab-btn active" data-tab="members">👥 Members</button>
            <button class="tab-btn" data-tab="guests">🎫 Guest Progress</button>
            <button class="tab-btn" data-tab="birthdays">🎂 Birthdays</button>
            <button class="tab-btn" data-tab="anniversaries">🎉 Induction Anniversaries</button>
            <button class="tab-btn" data-tab="summary">📊 Summary Table</button>
        </div>

        <!-- Members Tab -->
        <div class="tab-content active" id="members-tab">
            <div class="section-title">
                <span>📋 Member Attendance & Standing</span>
            </div>
            <div class="cards-grid" id="memberCards">
                <div class="loading">Loading member data</div>
            </div>
        </div>

        <!-- Guests Tab -->
        <div class="tab-content" id="guests-tab">
            <div class="section-title">
                <span>🎯 Guest Progress Toward Membership</span>
            </div>
            <div class="cards-grid" id="guestCards">
                <div class="loading">Loading guest data</div>
            </div>
        </div>

        <!-- Birthdays Tab -->
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
            <div class="celebration-list" id="birthdayList">
                <div class="loading">Loading birthdays</div>
            </div>
        </div>

        <!-- Anniversaries Tab -->
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
            <div class="celebration-list" id="anniversaryList">
                <div class="loading">Loading anniversaries</div>
            </div>
        </div>

        <!-- Summary Tab -->
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
                <tbody id="summaryBody">
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // ============================================
        // CONFIGURATION - YOUR ACTUAL VALUES
        // ============================================
        const SHEET_ID = '2PACX-1vSR9ql0N2PIMP52x94cysgD8cJkHGU3X72zJt9aUspLewh4l5k8ukWdeguxcphFvtjGp25xoGVwdtEe';
        const MEMBER_REGISTRY_GID = '1821690489';
        const ALL_ATTENDANCE_GID = '1315129184';
        const GUEST_TRACKING_GID = '1284804990';
        const MEETING_SCHEDULE_GID = '1708148096';

        // ============================================
        // COMMITTEE ASSIGNMENTS (from PDF - RY 2025-2026)
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
        // GLOBAL DATA STORAGE
        // ============================================
        let memberData = [];
        let attendanceData = [];
        let guestData = [];
        let meetingSchedule = [];
        let currentPeriod = 'Q2';
        let currentBirthdayMonth = 'all';
        let currentAnniversaryMonth = 'all';

        // ============================================
        // DATA FETCHING FROM GOOGLE SHEETS
        // ============================================
        async function fetchSheetData(gid) {
            const url = \`https://docs.google.com/spreadsheets/d/e/\${SHEET_ID}/pub?gid=\${gid}&single=true&output=csv\`;
            try {
                const response = await fetch(url);
                const text = await response.text();
                return parseCSV(text);
            } catch (error) {
                console.error('Error fetching sheet:', error);
                return [];
            }
        }

        function parseCSV(text) {
            const lines = text.split('\\n');
            if (lines.length < 2) return [];
            const headers = parseCSVLine(lines[0]);
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
            showLoading(true);
            
            try {
                const [members, attendance, guests, schedule] = await Promise.all([
                    fetchSheetData(MEMBER_REGISTRY_GID),
                    fetchSheetData(ALL_ATTENDANCE_GID),
                    fetchSheetData(GUEST_TRACKING_GID),
                    fetchSheetData(MEETING_SCHEDULE_GID)
                ]);
                
                memberData = processMembers(members);
                attendanceData = attendance;
                guestData = processGuests(guests);
                meetingSchedule = schedule;
                
                calculateMemberAttendance();
                setupEventListeners();
                renderAll();
            } catch (error) {
                console.error('Initialization error:', error);
                showError('Failed to load data. Please check your Google Sheet configuration.');
            }
            
            showLoading(false);
        }

        function showLoading(show) {
            document.querySelectorAll('.loading').forEach(el => {
                el.style.display = show ? 'block' : 'none';
            });
        }

        function showError(message) {
            document.getElementById('memberCards').innerHTML = '<div class="error-message">' + message + '</div>';
        }

        // ============================================
        // DATA PROCESSING
        // ============================================
        function processMembers(rawData) {
            return rawData
                .filter(row => row['Full Name'] && row['Full Name'] !== 'Full Name' && !row['Full Name'].includes('MEMBER REGISTRY'))
                .map((row, index) => ({
                    id: index + 1,
                    name: row['Full Name'] || '',
                    firstName: row['First Name'] || '',
                    lastName: row['Last Name'] || '',
                    email: row['Email'] || row['Email Address'] || '',
                    contact: row['Contact'] || row['Contact Number'] || '',
                    dob: row['Date of Birth'] || row['DOB'] || '',
                    inducted: row['Date Inducted'] || row['Inducted'] || '',
                    status: row['Status'] || 'Active',
                    category: row['Category'] || 'Rotaractor'
                }));
        }

        function processGuests(rawData) {
            return rawData
                .filter(row => row['First Name'] && row['First Name'] !== 'First Name' && !row['First Name'].includes('CLUB REGISTER'))
                .map(row => ({
                    name: (row['First Name'] || '') + ' ' + (row['Last Name'] || '').trim(),
                    firstName: row['First Name'] || '',
                    lastName: row['Last Name'] || '',
                    status: row['Status'] || 'NO ATTENDANCE',
                    meetingAttendance: parseInt(row['Total out of Six (Meetings)']) || 0,
                    totalMeetings: 6,
                    meetingPercentage: parseFloat(row['% Total Meetings \\n(Req. 60%)']) * 100 || 0,
                    projectAttendance: parseInt(row['Total out of Five (Projects)']) || 0,
                    totalProjects: 5,
                    projectPercentage: parseFloat(row['% Total Projects \\n(Req. 50%)']) * 100 || 0,
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
                    const matchesPeriod = period === 'Annual' || a['Quarter'] === period || 
                                          (period === 'H1' && (a['Quarter'] === 'Q1' || a['Quarter'] === 'Q2')) ||
                                          (period === 'H2' && (a['Quarter'] === 'Q3' || a['Quarter'] === 'Q4'));
                    return matchesName && matchesPeriod;
                });
                
                member.businessMeetings = memberAttendance.filter(a => a['Meeting Type'] === 'Business Meeting').length;
                member.fellowshipMeetings = memberAttendance.filter(a => a['Meeting Type'] === 'Fellowship Meeting').length;
                member.projects = memberAttendance.filter(a => a['Meeting Type'] === 'Project').length;
                member.committeeMeetings = memberAttendance.filter(a => a['Meeting Type'] && a['Meeting Type'].includes('Committee Meeting')).length;
                
                const periodMeetings = meetingSchedule.filter(m => {
                    const matchesPeriod = period === 'Annual' || m['Quarter'] === period ||
                                          (period === 'H1' && (m['Quarter'] === 'Q1' || m['Quarter'] === 'Q2')) ||
                                          (period === 'H2' && (m['Quarter'] === 'Q3' || m['Quarter'] === 'Q4'));
                    return matchesPeriod;
                });
                
                member.totalBusinessMeetings = periodMeetings.filter(m => m['Type'] === 'Business Meeting').length || 2;
                member.totalFellowshipMeetings = periodMeetings.filter(m => m['Type'] === 'Fellowship Meeting').length || 2;
                member.totalProjects = periodMeetings.filter(m => m['Type'] === 'Project').length || 5;
                
                const totalRegularMeetings = member.totalBusinessMeetings + member.totalFellowshipMeetings;
                const attendedRegularMeetings = member.businessMeetings + member.fellowshipMeetings;
                member.overallPercentage = totalRegularMeetings > 0 ? Math.round((attendedRegularMeetings / totalRegularMeetings) * 100) : 0;
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

        function formatDate(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

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
            document.getElementById('periodSelect').addEventListener('change', (e) => {
                currentPeriod = e.target.value;
                calculateMemberAttendance();
                renderAll();
            });

            document.getElementById('statusFilter').addEventListener('change', renderMembers);
            document.getElementById('committeeFilter').addEventListener('change', renderMembers);
            document.getElementById('searchInput').addEventListener('input', renderMembers);

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    e.target.classList.add('active');
                    document.getElementById(e.target.dataset.tab + '-tab').classList.add('active');
                });
            });

            document.querySelectorAll('#birthdayMonthFilter .filter-pill').forEach(pill => {
                pill.addEventListener('click', (e) => {
                    document.querySelectorAll('#birthdayMonthFilter .filter-pill').forEach(p => p.classList.remove('active'));
                    e.target.classList.add('active');
                    currentBirthdayMonth = e.target.dataset.month;
                    renderBirthdays();
                });
            });

            document.querySelectorAll('#anniversaryMonthFilter .filter-pill').forEach(pill => {
                pill.addEventListener('click', (e) => {
                    document.querySelectorAll('#anniversaryMonthFilter .filter-pill').forEach(p => p.classList.remove('active'));
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
            const activeMembers = memberData.filter(m => !m.status.toLowerCase().includes('terminated'));
            const goodStandingCount = activeMembers.filter(m => isGoodStanding(m)).length;
            const newMembersCount = activeMembers.filter(m => isNewMember(m.inducted)).length;
            const activeGuestsCount = guestData.filter(g => g.status !== 'NO ATTENDANCE').length;

            document.getElementById('totalMembers').textContent = activeMembers.length;
            document.getElementById('goodStanding').textContent = goodStandingCount;
            document.getElementById('needsAttention').textContent = activeMembers.length - goodStandingCount;
            document.getElementById('activeGuests').textContent = activeGuestsCount;
            document.getElementById('newMembers').textContent = newMembersCount;
        }

        function renderMembers() {
            const container = document.getElementById('memberCards');
            const statusFilter = document.getElementById('statusFilter').value;
            const committeeFilter = document.getElementById('committeeFilter').value;
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();

            let filtered = memberData.filter(m => {
                if (searchTerm && !m.name.toLowerCase().includes(searchTerm)) return false;
                const isTerminated = m.status && m.status.toLowerCase().includes('terminated');
                if (statusFilter === 'good' && (!isGoodStanding(m) || isTerminated)) return false;
                if (statusFilter === 'not-good' && (isGoodStanding(m) || isTerminated)) return false;
                if (statusFilter === 'new' && !isNewMember(m.inducted)) return false;
                if (committeeFilter !== 'all') {
                    const committees = getCommittees(m.name);
                    if (!committees.includes(committeeFilter)) return false;
                }
                return true;
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No members match the current filters</div>';
                return;
            }

            container.innerHTML = filtered.map(member => {
                const committees = getCommittees(member.name);
                const isNew = isNewMember(member.inducted);
                const onBoard = isOnBoard(member.name);
                const yearsInducted = calculateYearsInducted(member.inducted);
                const age = calculateAge(member.dob);
                const isTerminated = member.status && member.status.toLowerCase().includes('terminated');
                const goodStanding = isGoodStanding(member);

                return '<div class="member-card ' + (isTerminated ? '' : (goodStanding ? 'good-standing' : 'not-good-standing')) + '">' +
                    '<div class="card-header">' +
                        '<div class="member-name">' + member.name + '</div>' +
                        '<div class="member-badges">' +
                            (isTerminated ? '<span class="badge badge-terminated">Terminated</span>' : '<span class="badge badge-member">Member</span>') +
                            (isNew && !isTerminated ? '<span class="badge badge-new">New</span>' : '') +
                            (onBoard && !isTerminated ? '<span class="badge badge-board">Board</span>' : '') +
                        '</div>' +
                    '</div>' +
                    '<div class="member-details">' +
                        '<p>📧 ' + (member.email || '-') + '</p>' +
                        '<p>📱 ' + (member.contact || '-') + '</p>' +
                        '<p>🎂 Age: ' + age + ' | 🗓️ Member for ' + yearsInducted + ' year' + (yearsInducted !== 1 ? 's' : '') + '</p>' +
                        '<p>📅 Inducted: ' + formatFullDate(member.inducted) + '</p>' +
                        (committees.length > 0 ? '<p>🏷️ ' + committees.map(c => '<span class="committee-tag">' + c + '</span>').join('') + '</p>' : '') +
                    '</div>' +
                    (!isTerminated ? 
                    '<div class="progress-section">' +
                        '<div class="progress-item">' +
                            '<div class="progress-label"><span>Business Meetings</span><span>' + member.businessMeetings + '/' + member.totalBusinessMeetings + '</span></div>' +
                            '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(member.businessMeetings/member.totalBusinessMeetings*100) + '" style="width: ' + Math.min(member.businessMeetings/member.totalBusinessMeetings*100, 100) + '%"></div></div>' +
                        '</div>' +
                        '<div class="progress-item">' +
                            '<div class="progress-label"><span>Fellowship Meetings</span><span>' + member.fellowshipMeetings + '/' + member.totalFellowshipMeetings + '</span></div>' +
                            '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(member.fellowshipMeetings/member.totalFellowshipMeetings*100) + '" style="width: ' + Math.min(member.fellowshipMeetings/member.totalFellowshipMeetings*100, 100) + '%"></div></div>' +
                        '</div>' +
                        '<div class="progress-item">' +
                            '<div class="progress-label"><span>Projects</span><span>' + member.projects + '/' + member.totalProjects + '</span></div>' +
                            '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(member.projects/member.totalProjects*100) + '" style="width: ' + Math.min(member.projects/member.totalProjects*100, 100) + '%"></div></div>' +
                        '</div>' +
                        '<div class="progress-item">' +
                            '<div class="progress-label"><span>Committee Meetings</span><span>' + member.committeeMeetings + '</span></div>' +
                            '<div class="progress-bar"><div class="progress-fill good" style="width: ' + (member.committeeMeetings > 0 ? '100' : '0') + '%"></div></div>' +
                        '</div>' +
                        '<div class="progress-item">' +
                            '<div class="progress-label"><span>Overall Attendance (60% req.)</span><span>' + member.overallPercentage + '%</span></div>' +
                            '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(member.overallPercentage) + '" style="width: ' + Math.min(member.overallPercentage, 100) + '%"></div></div>' +
                        '</div>' +
                    '</div>' : '<p style="color: #7f8c8d; text-align: center; padding: 20px;">Member terminated - attendance not tracked</p>') +
                '</div>';
            }).join('');
        }

        function renderGuests() {
            const container = document.getElementById('guestCards');
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const memberNames = memberData.map(m => m.name.toLowerCase());
            
            let filtered = guestData.filter(g => {
                if (searchTerm && !g.name.toLowerCase().includes(searchTerm)) return false;
                if (memberNames.includes(g.name.toLowerCase())) return false;
                return true;
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No guests found</div>';
                return;
            }

            container.innerHTML = filtered.map(guest => {
                const committees = getCommittees(guest.name);
                const meetingMet = guest.meetingPercentage >= 60;
                const projectMet = guest.projectPercentage >= 50;

                return '<div class="member-card guest-card">' +
                    '<div class="card-header">' +
                        '<div class="member-name">' + guest.name + '</div>' +
                        '<div class="member-badges"><span class="badge badge-guest">Guest</span></div>' +
                    '</div>' +
                    '<div class="member-details">' +
                        '<p>📊 Status: <strong>' + guest.status + '</strong></p>' +
                        (guest.ugStudent ? '<p>🎓 UG Student/Graduate: ✅</p>' : '<p>🎓 UG Student/Graduate: ❌</p>') +
                        (committees.length > 0 ? '<p>🏷️ ' + committees.map(c => '<span class="committee-tag">' + c + '</span>').join('') + '</p>' : '') +
                    '</div>' +
                    '<div class="progress-section">' +
                        '<div class="progress-item">' +
                            '<div class="progress-label"><span>Meeting Attendance (60% req.)</span><span>' + guest.meetingAttendance + '/' + guest.totalMeetings + ' (' + Math.round(guest.meetingPercentage) + '%)</span></div>' +
                            '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(guest.meetingPercentage) + '" style="width: ' + Math.min(guest.meetingPercentage, 100) + '%"></div></div>' +
                        '</div>' +
                        '<div class="progress-item">' +
                            '<div class="progress-label"><span>Project Participation (50% req.)</span><span>' + guest.projectAttendance + '/' + guest.totalProjects + ' (' + Math.round(guest.projectPercentage) + '%)</span></div>' +
                            '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(guest.projectPercentage * 1.2) + '" style="width: ' + Math.min(guest.projectPercentage * 2, 100) + '%"></div></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="checklist">' +
                        '<div class="checklist-item ' + (guest.infoSession ? 'completed' : 'pending') + '"><span class="checklist-icon">' + (guest.infoSession ? '✅' : '⬜') + '</span><span>Information Session</span></div>' +
                        '<div class="checklist-item ' + (guest.committeeMeeting ? 'completed' : 'pending') + '"><span class="checklist-icon">' + (guest.committeeMeeting ? '✅' : '⬜') + '</span><span>Committee Meeting</span></div>' +
                        '<div class="checklist-item ' + (meetingMet ? 'completed' : 'pending') + '"><span class="checklist-icon">' + (meetingMet ? '✅' : '⬜') + '</span><span>60% Meetings</span></div>' +
                        '<div class="checklist-item ' + (projectMet ? 'completed' : 'pending') + '"><span class="checklist-icon">' + (projectMet ? '✅' : '⬜') + '</span><span>50% Projects</span></div>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        function renderBirthdays() {
            const container = document.getElementById('birthdayList');
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            let filtered = memberData.filter(m => {
                if (!m.dob) return false;
                const isTerminated = m.status && m.status.toLowerCase().includes('terminated');
                if (isTerminated) return false;
                const date = new Date(m.dob);
                if (isNaN(date.getTime())) return false;
                if (currentBirthdayMonth === 'all') return true;
                return date.getMonth() + 1 === parseInt(currentBirthdayMonth);
            });

            filtered.sort((a, b) => {
                const dateA = new Date(a.dob);
                const dateB = new Date(b.dob);
                if (dateA.getMonth() !== dateB.getMonth()) return dateA.getMonth() - dateB.getMonth();
                return dateA.getDate() - dateB.getDate();
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No birthdays found for this filter</div>';
                return;
            }

            container.innerHTML = filtered.map(member => {
                const dob = new Date(member.dob);
                const age = calculateAge(member.dob);
                return '<div class="celebration-card"><div class="celebration-icon">🎂</div><div class="celebration-info"><h4>' + member.name + '</h4><p>' + monthNames[dob.getMonth() + 1] + ' ' + dob.getDate() + ' • Turning ' + (age + 1) + '</p></div></div>';
            }).join('');
        }

        function renderAnniversaries() {
            const container = document.getElementById('anniversaryList');
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            let filtered = memberData.filter(m => {
                if (!m.inducted) return false;
                const isTerminated = m.status && m.status.toLowerCase().includes('terminated');
                if (isTerminated) return false;
                const date = new Date(m.inducted);
                if (isNaN(date.getTime())) return false;
                if (currentAnniversaryMonth === 'all') return true;
                return date.getMonth() + 1 === parseInt(currentAnniversaryMonth);
            });

            filtered.sort((a, b) => {
                const dateA = new Date(a.inducted);
                const dateB = new Date(b.inducted);
                if (dateA.getMonth() !== dateB.getMonth()) return dateA.getMonth() - dateB.getMonth();
                return dateA.getDate() - dateB.getDate();
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No induction anniversaries found for this filter</div>';
                return;
            }

            container.innerHTML = filtered.map(member => {
                const inducted = new Date(member.inducted);
                const years = calculateYearsInducted(member.inducted);
                return '<div class="celebration-card"><div class="celebration-icon">🎉</div><div class="celebration-info"><h4>' + member.name + '</h4><p>' + monthNames[inducted.getMonth() + 1] + ' ' + inducted.getDate() + ' • ' + (years + 1) + ' year' + (years !== 0 ? 's' : '') + ' in RCUG</p></div></div>';
            }).join('');
        }

        function renderSummaryTable() {
            const tbody = document.getElementById('summaryBody');
            const activeMembers = memberData.filter(m => !(m.status && m.status.toLowerCase().includes('terminated')));

            tbody.innerHTML = activeMembers.map(member => {
                const committees = getCommittees(member.name);
                const goodStanding = isGoodStanding(member);
                return '<tr><td>' + member.name + '</td><td>' + (committees.join(', ') || '-') + '</td><td>' + member.businessMeetings + '/' + member.totalBusinessMeetings + '</td><td>' + member.fellowshipMeetings + '/' + member.totalFellowshipMeetings + '</td><td>' + member.projects + '/' + member.totalProjects + '</td><td>' + (member.committeeMeetings || 0) + '</td><td>' + member.overallPercentage + '%</td><td style="color: ' + (goodStanding ? '#27ae60' : '#e74c3c') + '">' + (goodStanding ? '✅ Good' : '⚠️ Check') + '</td></tr>';
            }).join('');
        }

        // ============================================
        // EXPORT FUNCTIONS
        // ============================================
        function exportBirthdays() {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let data = memberData
                .filter(m => m.dob && !(m.status && m.status.toLowerCase().includes('terminated')))
                .filter(m => { const d = new Date(m.dob); return !isNaN(d.getTime()) && (currentBirthdayMonth === 'all' || d.getMonth() + 1 === parseInt(currentBirthdayMonth)); })
                .map(m => { const dob = new Date(m.dob); return { Name: m.name, Month: monthNames[dob.getMonth() + 1], Day: dob.getDate(), 'Turning Age': calculateAge(m.dob) + 1 }; });
            downloadCSV(data, 'RCUG_Birthdays_' + (currentBirthdayMonth === 'all' ? 'All_Months' : monthNames[parseInt(currentBirthdayMonth)]) + '.csv');
        }

        function exportAnniversaries() {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let data = memberData
                .filter(m => m.inducted && !(m.status && m.status.toLowerCase().includes('terminated')))
                .filter(m => { const d = new Date(m.inducted); return !isNaN(d.getTime()) && (currentAnniversaryMonth === 'all' || d.getMonth() + 1 === parseInt(currentAnniversaryMonth)); })
                .map(m => { const inducted = new Date(m.inducted); return { Name: m.name, Month: monthNames[inducted.getMonth() + 1], Day: inducted.getDate(), 'Years in RCUG': calculateYearsInducted(m.inducted) + 1 }; });
            downloadCSV(data, 'RCUG_Anniversaries_' + (currentAnniversaryMonth === 'all' ? 'All_Months' : monthNames[parseInt(currentAnniversaryMonth)]) + '.csv');
        }

        function exportSummary() {
            const activeMembers = memberData.filter(m => !(m.status && m.status.toLowerCase().includes('terminated')));
            let data = activeMembers.map(m => ({
                Name: m.name, Committee: getCommittees(m.name).join('; ') || '-',
                'Business Meetings': m.businessMeetings + '/' + m.totalBusinessMeetings,
                'Fellowship Meetings': m.fellowshipMeetings + '/' + m.totalFellowshipMeetings,
                'Projects': m.projects + '/' + m.totalProjects,
                'Committee Meetings': m.committeeMeetings || 0,
                'Overall %': m.overallPercentage + '%',
                'Status': isGoodStanding(m) ? 'Good Standing' : 'Needs Attention'
            }));
            downloadCSV(data, 'RCUG_Attendance_Summary_' + currentPeriod + '.csv');
        }

        function downloadCSV(data, filename) {
            if (data.length === 0) { alert('No data to export'); return; }
            const headers = Object.keys(data[0]);
            const csv = [headers.join(','), ...data.map(row => headers.map(h => '"' + row[h] + '"').join(','))].join('\\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>`;
