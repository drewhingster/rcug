<!DOCTYPE html>
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
        // CONFIGURATION - UPDATE THESE VALUES
        // ============================================
        const SHEET_ID = '2PACX-1vSR9ql0N2PIMP52x94cysgD8cJkHGU3X72zJt9aUspLewh4l5k8ukWdeguxcphFvtjGp25xoGVwdtEe'; // Replace with your published sheet ID
        const MEMBER_REGISTRY_GID = '1821690489'; // Update with actual GID for Member Registry sheet
        const ALL_ATTENDANCE_GID = '1315129184'; // Update with actual GID for All Attendance sheet
        const GUEST_TRACKING_GID = '1284804990'; // Update with actual GID for Guest Tracking sheet
        const MEETING_SCHEDULE_GID = '1708148096'; // Update with actual GID for Meeting Schedule sheet

        // ============================================
        // COMMITTEE ASSIGNMENTS (from PDF)
        // ============================================
        const COMMITTEE_ASSIGNMENTS = {
            // Members
            'Adanna Edwards': ['Finance', 'Professional Development'],
            'Andrew Hing': ['Club Service', 'Finance', 'Membership'],
            'Asif Khan': ['Finance', 'International Service', 'Public Image'],
            'Christina Harris': ['Club Service', 'Professional Development', 'Membership'],
            'Christine Samuels': ['Club Service', 'Finance'],
            'Cliffia Rollox': ['Club Service', 'Community Service', 'Public Image'], // Terminated
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
            // Guests with committee assignments
            'Orletta John': ['Community Service', 'Membership', 'Public Image'],
            'Parmesh Ramgobin': ['Community Service', 'Professional Development'],
            'Renika Anand': ['Community Service', 'International Service'],
            'Tamara Bascom': ['Club Service', 'Community Service', 'International Service']
        };

        // Board positions for RY 2025-2026
        const BOARD_MEMBERS = [
            'Jemima Stephenson', // President
            'Darin Hall', // Vice President
            'Ganesh Anand', // Secretary
            'Adanna Edwards', // Treasurer
            'Yushina Ramlall', // Finance Director
            'Darin Hall', // Community Service Director
            'Jemima Stephenson', // International Service Director
            'Nandita Singh', // Professional Development Director
            'Kadeem Bowen', // Club Service Director
            'Vishal Roopnarine', // Sergeant-at-Arms
            'Andrew Hing' // Assistant Secretary
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
        // DATA FETCHING
        // ============================================
        async function fetchSheetData(gid) {
            const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}`;
            try {
                const response = await fetch(url);
                const text = await response.text();
                const json = JSON.parse(text.substring(47, text.length - 2));
                return parseSheetData(json);
            } catch (error) {
                console.error('Error fetching sheet:', error);
                return [];
            }
        }

        function parseSheetData(json) {
            if (!json.table || !json.table.rows) return [];
            const headers = json.table.cols.map(col => col.label || '');
            return json.table.rows.map(row => {
                const obj = {};
                row.c.forEach((cell, i) => {
                    if (headers[i]) {
                        obj[headers[i]] = cell ? (cell.v !== null ? cell.v : '') : '';
                    }
                });
                return obj;
            });
        }

        // ============================================
        // INITIALIZATION
        // ============================================
        async function init() {
            document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
            
            // For demo purposes, using sample data
            // In production, uncomment the fetch calls and update GIDs
            loadSampleData();
            
            // Uncomment these for production:
            // memberData = await fetchSheetData(MEMBER_REGISTRY_GID);
            // attendanceData = await fetchSheetData(ALL_ATTENDANCE_GID);
            // guestData = await fetchSheetData(GUEST_TRACKING_GID);
            // meetingSchedule = await fetchSheetData(MEETING_SCHEDULE_GID);
            
            setupEventListeners();
            renderAll();
        }

        function loadSampleData() {
            // Sample member data based on your Member Registry
            memberData = [
                { id: 1, name: 'Adanna Edwards', firstName: 'Adanna', lastName: 'Edwards', email: 'adannaedwards91@gmail.com', contact: '6520114', dob: '1991-08-23', inducted: '2025-02-22', status: 'Active', category: 'Rotaractor' },
                { id: 2, name: 'Andrew Hing', firstName: 'Andrew', lastName: 'Hing', email: 'andrewhingrcug@gmail.com', contact: '6567430', dob: '1995-07-21', inducted: '2019-03-09', status: 'Active', category: 'Rotaractor' },
                { id: 3, name: 'Asif Khan', firstName: 'Asif', lastName: 'Khan', email: 'asifkhan007134@gmail.com', contact: '6459393', dob: '1997-11-16', inducted: '2025-05-10', status: 'Active', category: 'Rotaractor' },
                { id: 4, name: 'Christina Harris', firstName: 'Christina', lastName: 'Harris', email: 'christinakharris22@gmail.com', contact: '6250748', dob: '1996-09-06', inducted: '2015-12-09', status: 'Active', category: 'Rotaractor' },
                { id: 5, name: 'Christine Samuels', firstName: 'Christine', lastName: 'Samuels', email: 'slimtine_nica17@yahoo.com', contact: '6894881', dob: '1995-05-17', inducted: '2019-03-09', status: 'Active', category: 'Rotaractor' },
                { id: 6, name: 'Cliffia Rollox', firstName: 'Cliffia', lastName: 'Rollox', email: 'cliffiarollox@gmail.com', contact: '6419954', dob: '1999-08-22', inducted: '2019-01-12', status: 'Terminated 19th Dec 2025', category: 'Rotaractor' },
                { id: 7, name: 'Darin Hall', firstName: 'Darin', lastName: 'Hall', email: 'darinhall19@gmail.com', contact: '6033778', dob: '2003-12-05', inducted: '2023-04-29', status: 'Active', category: 'Rotaractor' },
                { id: 8, name: 'Dequan Wray', firstName: 'Dequan', lastName: 'Wray', email: 'quan.wray@gmail.com', contact: '6670105', dob: '1998-08-14', inducted: '2021-02-13', status: 'Active', category: 'Rotaractor' },
                { id: 9, name: 'Ganesh Anand', firstName: 'Ganesh', lastName: 'Anand', email: 'anandg.guy@gmail.com', contact: '6140036', dob: '1994-11-10', inducted: '2019-01-12', status: 'Active', category: 'Rotaractor' },
                { id: 10, name: 'Jaya Persaud', firstName: 'Jaya', lastName: 'Persaud', email: 'jayapersaud.2000@gmail.com', contact: '6422552', dob: '2000-03-30', inducted: '2020-09-26', status: 'Active', category: 'Rotaractor' },
                { id: 11, name: 'Jemima Stephenson', firstName: 'Jemima', lastName: 'Stephenson', email: 'jemmie2461@gmail.com', contact: '6861150', dob: '1994-12-26', inducted: '2016-03-12', status: 'Active', category: 'Rotaractor' },
                { id: 12, name: 'Kadeem Bowen', firstName: 'Kadeem', lastName: 'Bowen', email: 'kadeembowen835@gmail.com', contact: '6556661', dob: '1998-05-03', inducted: '2019-06-22', status: 'Active', category: 'Rotaractor' },
                { id: 13, name: 'Liane Langford', firstName: 'Liane', lastName: 'Langford', email: 'lianelangford52@gmail.com', contact: '6428977', dob: '2001-06-26', inducted: '2025-12-07', status: 'Active', category: 'Rotaractor' },
                { id: 14, name: 'Mariah Lawrence', firstName: 'Mariah', lastName: 'Lawrence', email: 'mariahlawrence65@gmail.com', contact: '6542796', dob: '2002-04-05', inducted: '2025-06-28', status: 'Active', category: 'Rotaractor' },
                { id: 15, name: 'Nandita Singh', firstName: 'Nandita', lastName: 'Singh', email: 'nanditasingh18@outlook.com', contact: '6214829', dob: '1998-01-15', inducted: '2019-03-09', status: 'Active', category: 'Rotaractor' },
                { id: 16, name: 'Ngari Blair', firstName: 'Ngari', lastName: 'Blair', email: 'ngari.blair@gmail.com', contact: '6123456', dob: '1999-07-20', inducted: '2024-02-10', status: 'Active', category: 'Rotaractor' },
                { id: 17, name: 'Omari London', firstName: 'Omari', lastName: 'London', email: 'omarilondon18@gmail.com', contact: '6805041', dob: '1998-10-12', inducted: '2019-03-09', status: 'Active', category: 'Rotaractor' },
                { id: 18, name: 'Ruth Manbodh', firstName: 'Ruth', lastName: 'Manbodh', email: 'ruthmanbodh@gmail.com', contact: '6387401', dob: '1995-02-14', inducted: '2019-01-12', status: 'Active', category: 'Rotaractor' },
                { id: 19, name: 'Tishana Bheer', firstName: 'Tishana', lastName: 'Bheer', email: 'tishana.bheer@gmail.com', contact: '6234567', dob: '1999-04-08', inducted: '2024-01-20', status: 'Active', category: 'Rotaractor' },
                { id: 20, name: 'Vishal Roopnarine', firstName: 'Vishal', lastName: 'Roopnarine', email: 'vishalroopnarine@gmail.com', contact: '6297577', dob: '1994-06-30', inducted: '2019-01-12', status: 'Active', category: 'Rotaractor' },
                { id: 21, name: 'Yushina Ramlall', firstName: 'Yushina', lastName: 'Ramlall', email: 'yushina.ramlall@gmail.com', contact: '6345678', dob: '1997-09-25', inducted: '2020-11-14', status: 'Active', category: 'Rotaractor' },
                { id: 22, name: 'Orletta John', firstName: 'Orletta', lastName: 'John', email: 'orletta.john@gmail.com', contact: '6456789', dob: '2000-03-15', inducted: '2025-12-07', status: 'Active', category: 'Rotaractor' },
                { id: 23, name: 'Tamara Bascom', firstName: 'Tamara', lastName: 'Bascom', email: 'tamara.bascom@gmail.com', contact: '6567890', dob: '1999-11-02', inducted: '2025-12-07', status: 'Active', category: 'Rotaractor' }
            ];

            // Sample attendance stats (you'll replace with actual calculated data)
            memberData.forEach(m => {
                m.businessMeetings = Math.floor(Math.random() * 3);
                m.fellowshipMeetings = Math.floor(Math.random() * 3);
                m.projects = Math.floor(Math.random() * 5);
                m.committeeMeetings = Math.floor(Math.random() * 2);
                m.totalBusinessMeetings = 2;
                m.totalFellowshipMeetings = 2;
                m.totalProjects = 5;
                m.overallPercentage = ((m.businessMeetings + m.fellowshipMeetings) / 4 * 100).toFixed(0);
            });

            // Sample guest data
            guestData = [
                { name: 'Parmesh Ramgobin', firstName: 'Parmesh', lastName: 'Ramgobin', status: 'NEEDS MORE WORK', meetingAttendance: 2, totalMeetings: 6, meetingPercentage: 33, projectAttendance: 2, totalProjects: 5, projectPercentage: 40, infoSession: false, committeeMeeting: false, ugStudent: true },
                { name: 'Renika Anand', firstName: 'Renika', lastName: 'Anand', status: 'NEEDS MORE WORK', meetingAttendance: 3, totalMeetings: 6, meetingPercentage: 50, projectAttendance: 3, totalProjects: 5, projectPercentage: 60, infoSession: true, committeeMeeting: false, ugStudent: true },
                { name: 'Devkumar Gangaram', firstName: 'Devkumar', lastName: 'Gangaram', status: 'NEEDS MORE WORK', meetingAttendance: 1, totalMeetings: 6, meetingPercentage: 17, projectAttendance: 3, totalProjects: 5, projectPercentage: 60, infoSession: false, committeeMeeting: false, ugStudent: true },
                { name: 'Tatyana Jacobs', firstName: 'Tatyana', lastName: 'Jacobs', status: 'NEEDS MORE WORK', meetingAttendance: 4, totalMeetings: 6, meetingPercentage: 67, projectAttendance: 2, totalProjects: 5, projectPercentage: 40, infoSession: true, committeeMeeting: true, ugStudent: true },
                { name: 'Vani Singh', firstName: 'Vani', lastName: 'Singh', status: 'NO ATTENDANCE', meetingAttendance: 0, totalMeetings: 6, meetingPercentage: 0, projectAttendance: 1, totalProjects: 5, projectPercentage: 20, infoSession: false, committeeMeeting: false, ugStudent: true },
                { name: 'Alexei Cox', firstName: 'Alexei', lastName: 'Cox', status: 'NO ATTENDANCE', meetingAttendance: 0, totalMeetings: 6, meetingPercentage: 0, projectAttendance: 1, totalProjects: 5, projectPercentage: 20, infoSession: false, committeeMeeting: false, ugStudent: true }
            ];
        }

        // ============================================
        // EVENT LISTENERS
        // ============================================
        function setupEventListeners() {
            document.getElementById('periodSelect').addEventListener('change', (e) => {
                currentPeriod = e.target.value;
                renderAll();
            });

            document.getElementById('statusFilter').addEventListener('change', renderMembers);
            document.getElementById('committeeFilter').addEventListener('change', renderMembers);
            document.getElementById('searchInput').addEventListener('input', renderMembers);

            // Tab switching
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    e.target.classList.add('active');
                    document.getElementById(e.target.dataset.tab + '-tab').classList.add('active');
                });
            });

            // Birthday month filter
            document.querySelectorAll('#birthdayMonthFilter .filter-pill').forEach(pill => {
                pill.addEventListener('click', (e) => {
                    document.querySelectorAll('#birthdayMonthFilter .filter-pill').forEach(p => p.classList.remove('active'));
                    e.target.classList.add('active');
                    currentBirthdayMonth = e.target.dataset.month;
                    renderBirthdays();
                });
            });

            // Anniversary month filter
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
        // UTILITY FUNCTIONS
        // ============================================
        function calculateAge(dateString) {
            if (!dateString) return '-';
            const today = new Date();
            const birthDate = new Date(dateString);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }

        function calculateYearsInducted(dateString) {
            if (!dateString) return 0;
            const today = new Date();
            const inductedDate = new Date(dateString);
            let years = today.getFullYear() - inductedDate.getFullYear();
            const monthDiff = today.getMonth() - inductedDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < inductedDate.getDate())) {
                years--;
            }
            return years;
        }

        function isNewMember(inductedDate) {
            if (!inductedDate) return false;
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return new Date(inductedDate) > sixMonthsAgo;
        }

        function getProgressClass(percentage) {
            if (percentage >= 60) return 'good';
            if (percentage >= 40) return 'warning';
            return 'danger';
        }

        function isGoodStanding(member) {
            return member.overallPercentage >= 60 && !member.status.toLowerCase().includes('terminated');
        }

        function getCommittees(name) {
            return COMMITTEE_ASSIGNMENTS[name] || [];
        }

        function isOnBoard(name) {
            return BOARD_MEMBERS.includes(name);
        }

        function formatDate(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
                // Search filter
                if (searchTerm && !m.name.toLowerCase().includes(searchTerm)) return false;
                
                // Status filter
                if (statusFilter === 'good' && !isGoodStanding(m)) return false;
                if (statusFilter === 'not-good' && isGoodStanding(m)) return false;
                if (statusFilter === 'new' && !isNewMember(m.inducted)) return false;
                
                // Committee filter
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
                const isTerminated = member.status.toLowerCase().includes('terminated');
                const goodStanding = isGoodStanding(member);

                return `
                    <div class="member-card ${isTerminated ? '' : (goodStanding ? 'good-standing' : 'not-good-standing')}">
                        <div class="card-header">
                            <div class="member-name">${member.name}</div>
                            <div class="member-badges">
                                ${isTerminated ? '<span class="badge badge-terminated">Terminated</span>' : '<span class="badge badge-member">Member</span>'}
                                ${isNew && !isTerminated ? '<span class="badge badge-new">New</span>' : ''}
                                ${onBoard && !isTerminated ? '<span class="badge badge-board">Board</span>' : ''}
                            </div>
                        </div>
                        <div class="member-details">
                            <p>📧 ${member.email}</p>
                            <p>📱 ${member.contact}</p>
                            <p>🎂 Age: ${age} | 🗓️ Member for ${yearsInducted} year${yearsInducted !== 1 ? 's' : ''}</p>
                            <p>📅 Inducted: ${formatDate(member.inducted)}</p>
                            ${committees.length > 0 ? `<p>🏷️ ${committees.map(c => `<span class="committee-tag">${c}</span>`).join('')}</p>` : ''}
                        </div>
                        ${!isTerminated ? `
                        <div class="progress-section">
                            <div class="progress-item">
                                <div class="progress-label">
                                    <span>Business Meetings</span>
                                    <span>${member.businessMeetings}/${member.totalBusinessMeetings}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${getProgressClass(member.businessMeetings/member.totalBusinessMeetings*100)}" 
                                         style="width: ${member.businessMeetings/member.totalBusinessMeetings*100}%"></div>
                                </div>
                            </div>
                            <div class="progress-item">
                                <div class="progress-label">
                                    <span>Fellowship Meetings</span>
                                    <span>${member.fellowshipMeetings}/${member.totalFellowshipMeetings}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${getProgressClass(member.fellowshipMeetings/member.totalFellowshipMeetings*100)}" 
                                         style="width: ${member.fellowshipMeetings/member.totalFellowshipMeetings*100}%"></div>
                                </div>
                            </div>
                            <div class="progress-item">
                                <div class="progress-label">
                                    <span>Projects</span>
                                    <span>${member.projects}/${member.totalProjects}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${getProgressClass(member.projects/member.totalProjects*100)}" 
                                         style="width: ${member.projects/member.totalProjects*100}%"></div>
                                </div>
                            </div>
                            <div class="progress-item">
                                <div class="progress-label">
                                    <span>Overall Attendance</span>
                                    <span>${member.overallPercentage}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${getProgressClass(member.overallPercentage)}" 
                                         style="width: ${member.overallPercentage}%"></div>
                                </div>
                            </div>
                        </div>
                        ` : '<p style="color: #7f8c8d; text-align: center; padding: 20px;">Member terminated - attendance not tracked</p>'}
                    </div>
                `;
            }).join('');
        }

        function renderGuests() {
            const container = document.getElementById('guestCards');
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();

            let filtered = guestData.filter(g => {
                if (searchTerm && !g.name.toLowerCase().includes(searchTerm)) return false;
                return true;
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No guests found</div>';
                return;
            }

            container.innerHTML = filtered.map(guest => {
                const committees = getCommittees(guest.name);
                const meetingProgress = (guest.meetingAttendance / guest.totalMeetings * 100) || 0;
                const projectProgress = (guest.projectAttendance / guest.totalProjects * 100) || 0;

                return `
                    <div class="member-card guest-card">
                        <div class="card-header">
                            <div class="member-name">${guest.name}</div>
                            <div class="member-badges">
                                <span class="badge badge-guest">Guest</span>
                            </div>
                        </div>
                        <div class="member-details">
                            <p>📊 Status: <strong>${guest.status}</strong></p>
                            ${guest.ugStudent ? '<p>🎓 UG Student/Graduate: ✅</p>' : '<p>🎓 UG Student/Graduate: ❌</p>'}
                            ${committees.length > 0 ? `<p>🏷️ ${committees.map(c => `<span class="committee-tag">${c}</span>`).join('')}</p>` : ''}
                        </div>
                        <div class="progress-section">
                            <div class="progress-item">
                                <div class="progress-label">
                                    <span>Meeting Attendance (60% req.)</span>
                                    <span>${guest.meetingAttendance}/${guest.totalMeetings} (${guest.meetingPercentage}%)</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${getProgressClass(guest.meetingPercentage)}" 
                                         style="width: ${Math.min(guest.meetingPercentage, 100)}%"></div>
                                </div>
                            </div>
                            <div class="progress-item">
                                <div class="progress-label">
                                    <span>Project Participation (50% req.)</span>
                                    <span>${guest.projectAttendance}/${guest.totalProjects} (${guest.projectPercentage}%)</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${getProgressClass(guest.projectPercentage / 0.5)}" 
                                         style="width: ${Math.min(guest.projectPercentage * 2, 100)}%"></div>
                                </div>
                            </div>
                        </div>
                        <div class="checklist">
                            <div class="checklist-item ${guest.infoSession ? 'completed' : 'pending'}">
                                <span class="checklist-icon">${guest.infoSession ? '✅' : '⬜'}</span>
                                <span>Information Session</span>
                            </div>
                            <div class="checklist-item ${guest.committeeMeeting ? 'completed' : 'pending'}">
                                <span class="checklist-icon">${guest.committeeMeeting ? '✅' : '⬜'}</span>
                                <span>Committee Meeting</span>
                            </div>
                            <div class="checklist-item ${guest.meetingPercentage >= 60 ? 'completed' : 'pending'}">
                                <span class="checklist-icon">${guest.meetingPercentage >= 60 ? '✅' : '⬜'}</span>
                                <span>60% Meetings</span>
                            </div>
                            <div class="checklist-item ${guest.projectPercentage >= 50 ? 'completed' : 'pending'}">
                                <span class="checklist-icon">${guest.projectPercentage >= 50 ? '✅' : '⬜'}</span>
                                <span>50% Projects</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderBirthdays() {
            const container = document.getElementById('birthdayList');
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];

            let filtered = memberData.filter(m => {
                if (!m.dob || m.status.toLowerCase().includes('terminated')) return false;
                if (currentBirthdayMonth === 'all') return true;
                const month = new Date(m.dob).getMonth() + 1;
                return month === parseInt(currentBirthdayMonth);
            });

            // Sort by month, then day
            filtered.sort((a, b) => {
                const dateA = new Date(a.dob);
                const dateB = new Date(b.dob);
                if (dateA.getMonth() !== dateB.getMonth()) {
                    return dateA.getMonth() - dateB.getMonth();
                }
                return dateA.getDate() - dateB.getDate();
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No birthdays found for this filter</div>';
                return;
            }

            container.innerHTML = filtered.map(member => {
                const dob = new Date(member.dob);
                const age = calculateAge(member.dob);
                const monthName = monthNames[dob.getMonth() + 1];

                return `
                    <div class="celebration-card">
                        <div class="celebration-icon">🎂</div>
                        <div class="celebration-info">
                            <h4>${member.name}</h4>
                            <p>${monthName} ${dob.getDate()} • Turning ${age + 1}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderAnniversaries() {
            const container = document.getElementById('anniversaryList');
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];

            let filtered = memberData.filter(m => {
                if (!m.inducted || m.status.toLowerCase().includes('terminated')) return false;
                if (currentAnniversaryMonth === 'all') return true;
                const month = new Date(m.inducted).getMonth() + 1;
                return month === parseInt(currentAnniversaryMonth);
            });

            // Sort by month, then day
            filtered.sort((a, b) => {
                const dateA = new Date(a.inducted);
                const dateB = new Date(b.inducted);
                if (dateA.getMonth() !== dateB.getMonth()) {
                    return dateA.getMonth() - dateB.getMonth();
                }
                return dateA.getDate() - dateB.getDate();
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No induction anniversaries found for this filter</div>';
                return;
            }

            container.innerHTML = filtered.map(member => {
                const inducted = new Date(member.inducted);
                const years = calculateYearsInducted(member.inducted);
                const monthName = monthNames[inducted.getMonth() + 1];

                return `
                    <div class="celebration-card">
                        <div class="celebration-icon">🎉</div>
                        <div class="celebration-info">
                            <h4>${member.name}</h4>
                            <p>${monthName} ${inducted.getDate()} • ${years + 1} year${years !== 0 ? 's' : ''} in RCUG</p>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderSummaryTable() {
            const tbody = document.getElementById('summaryBody');
            const activeMembers = memberData.filter(m => !m.status.toLowerCase().includes('terminated'));

            tbody.innerHTML = activeMembers.map(member => {
                const committees = getCommittees(member.name);
                const goodStanding = isGoodStanding(member);

                return `
                    <tr>
                        <td>${member.name}</td>
                        <td>${committees.join(', ') || '-'}</td>
                        <td>${member.businessMeetings}/${member.totalBusinessMeetings}</td>
                        <td>${member.fellowshipMeetings}/${member.totalFellowshipMeetings}</td>
                        <td>${member.projects}/${member.totalProjects}</td>
                        <td>${member.committeeMeetings || 0}</td>
                        <td>${member.overallPercentage}%</td>
                        <td style="color: ${goodStanding ? '#27ae60' : '#e74c3c'}">${goodStanding ? '✅ Good' : '⚠️ Check'}</td>
                    </tr>
                `;
            }).join('');
        }

        // ============================================
        // EXPORT FUNCTIONS
        // ============================================
        function exportBirthdays() {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            
            let data = memberData
                .filter(m => m.dob && !m.status.toLowerCase().includes('terminated'))
                .filter(m => currentBirthdayMonth === 'all' || new Date(m.dob).getMonth() + 1 === parseInt(currentBirthdayMonth))
                .map(m => {
                    const dob = new Date(m.dob);
                    return {
                        Name: m.name,
                        Month: monthNames[dob.getMonth() + 1],
                        Day: dob.getDate(),
                        Age: calculateAge(m.dob) + 1
                    };
                });

            downloadCSV(data, `RCUG_Birthdays_${currentBirthdayMonth === 'all' ? 'All' : monthNames[currentBirthdayMonth]}.csv`);
        }

        function exportAnniversaries() {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            
            let data = memberData
                .filter(m => m.inducted && !m.status.toLowerCase().includes('terminated'))
                .filter(m => currentAnniversaryMonth === 'all' || new Date(m.inducted).getMonth() + 1 === parseInt(currentAnniversaryMonth))
                .map(m => {
                    const inducted = new Date(m.inducted);
                    return {
                        Name: m.name,
                        Month: monthNames[inducted.getMonth() + 1],
                        Day: inducted.getDate(),
                        Years: calculateYearsInducted(m.inducted) + 1
                    };
                });

            downloadCSV(data, `RCUG_Anniversaries_${currentAnniversaryMonth === 'all' ? 'All' : monthNames[currentAnniversaryMonth]}.csv`);
        }

        function exportSummary() {
            const activeMembers = memberData.filter(m => !m.status.toLowerCase().includes('terminated'));
            
            let data = activeMembers.map(m => ({
                Name: m.name,
                Committee: getCommittees(m.name).join('; ') || '-',
                'Business Meetings': `${m.businessMeetings}/${m.totalBusinessMeetings}`,
                'Fellowship Meetings': `${m.fellowshipMeetings}/${m.totalFellowshipMeetings}`,
                'Projects': `${m.projects}/${m.totalProjects}`,
                'Overall %': `${m.overallPercentage}%`,
                'Status': isGoodStanding(m) ? 'Good Standing' : 'Needs Attention'
            }));

            downloadCSV(data, `RCUG_Attendance_Summary_${currentPeriod}.csv`);
        }

        function downloadCSV(data, filename) {
            if (data.length === 0) {
                alert('No data to export');
                return;
            }
            
            const headers = Object.keys(data[0]);
            const csv = [
                headers.join(','),
                ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        // ============================================
        // INITIALIZE ON LOAD
        // ============================================
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
