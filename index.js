export default {
  async fetch(request, env, ctx) {
    return new Response(HTML_CONTENT, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=300'
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: linear-gradient(135deg, #1a1a2e, #16213e); min-height: 100vh; color: #fff; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; }
        header { text-align: center; padding: 20px 0; margin-bottom: 20px; }
        h1 { font-size: 2.2rem; background: linear-gradient(90deg, #e91e63, #9c27b0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px; }
        .subtitle { color: #bdc3c7; font-size: 1rem; }
        .loading { text-align: center; padding: 50px; color: #f1c40f; font-size: 1.2rem; }
        .error { text-align: center; padding: 50px; color: #e74c3c; font-size: 1rem; background: rgba(231,76,60,0.1); border-radius: 10px; margin: 20px; }
        .error a { color: #3498db; }
        
        /* Tabs */
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab { padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .tab.members { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
        .tab.members.active, .tab.members:hover { background: #2ecc71; color: #fff; }
        .tab.guests { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
        .tab.guests.active, .tab.guests:hover { background: #f1c40f; color: #333; }
        .tab.reports { background: rgba(155, 89, 182, 0.2); color: #9b59b6; }
        .tab.reports.active, .tab.reports:hover { background: #9b59b6; color: #fff; }
        
        /* Controls */
        .controls { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin-bottom: 20px; }
        .control-row { display: flex; gap: 15px; flex-wrap: wrap; align-items: center; margin-bottom: 15px; }
        .control-row:last-child { margin-bottom: 0; }
        .search-input { flex: 1; min-width: 200px; padding: 12px 16px; border: none; border-radius: 10px; font-size: 1rem; background: rgba(255,255,255,0.9); color: #333; }
        .filter-select { padding: 12px 16px; border: none; border-radius: 10px; font-size: 1rem; background: rgba(255,255,255,0.9); color: #333; cursor: pointer; }
        .refresh-btn { padding: 12px 20px; border: none; border-radius: 10px; font-size: 1rem; background: #3498db; color: #fff; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .refresh-btn:hover { background: #2980b9; }
        .export-btn { padding: 12px 20px; border: none; border-radius: 10px; font-size: 1rem; background: #e91e63; color: #fff; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .export-btn:hover { background: #c2185b; }
        .export-btn:disabled { background: #7f8c8d; cursor: not-allowed; }
        
        /* Stats */
        .stats-bar { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
        .stat-box { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 15px 25px; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: 700; color: #f1c40f; }
        .stat-label { font-size: 0.8rem; color: #bdc3c7; }
        
        /* Member Grid */
        .member-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
        .member-card { background: rgba(255,255,255,0.08); border-radius: 15px; padding: 20px; transition: transform 0.3s, box-shadow 0.3s; cursor: pointer; border-left: 4px solid #2ecc71; position: relative; }
        .member-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
        .member-card.guest { border-left-color: #f1c40f; }
        .member-card.good { border-left-color: #2ecc71; }
        .member-card.notgood { border-left-color: #e74c3c; }
        .member-card.eligible { border-left-color: #9b59b6; box-shadow: 0 0 15px rgba(155, 89, 182, 0.3); }
        .member-card.nodata { background: rgba(231, 76, 60, 0.25); border: 2px solid #e74c3c; border-left: 4px solid #e74c3c; }
        .member-card.terminated { background: rgba(127, 140, 141, 0.2); border-left-color: #7f8c8d; opacity: 0.8; }
        
        /* Card Actions */
        .card-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 5px; }
        .card-action-btn { background: rgba(255,255,255,0.2); border: none; border-radius: 5px; padding: 5px 10px; color: #fff; cursor: pointer; font-size: 0.7rem; transition: all 0.3s; }
        .card-action-btn:hover { background: rgba(255,255,255,0.4); }
        
        /* Card Content */
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-right: 80px; }
        .member-name { font-size: 1.2rem; font-weight: 600; }
        .member-tag { font-size: 0.7rem; color: #bdc3c7; margin-top: 3px; }
        .badge { padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; margin-left: 5px; vertical-align: middle; }
        .badge-new { background: #9b59b6; color: #fff; }
        .badge-board { background: #3498db; color: #fff; }
        .badge-nodata { background: #e74c3c; color: #fff; }
        .badge-terminated { background: #7f8c8d; color: #fff; }
        .status-badge { padding: 4px 10px; border-radius: 15px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; }
        .status-good { background: #27ae60; }
        .status-notgood { background: #e74c3c; }
        .status-needswork { background: #e67e22; }
        .status-noattendance { background: #7f8c8d; }
        .status-infosession { background: #1abc9c; }
        .status-notug { background: #c0392b; }
        .status-eligible { background: #9b59b6; }
        .status-nodata { background: #c0392b; }
        .status-terminated { background: #7f8c8d; }
        
        /* Progress Bars */
        .progress-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 0.85rem; }
        .progress-label { width: 100px; color: #bdc3c7; }
        .progress-bar { flex: 1; height: 10px; background: rgba(255,255,255,0.15); border-radius: 5px; overflow: hidden; margin: 0 10px; }
        .progress-fill { height: 100%; border-radius: 5px; transition: width 0.5s; }
        .progress-fill.meetings { background: linear-gradient(90deg, #3498db, #2980b9); }
        .progress-fill.projects { background: linear-gradient(90deg, #e74c3c, #c0392b); }
        .progress-fill.good { background: linear-gradient(90deg, #27ae60, #1e8449); }
        .progress-fill.board { background: linear-gradient(90deg, #9b59b6, #8e44ad); }
        .progress-value { width: 110px; text-align: right; font-weight: 600; font-size: 0.8rem; }
        
        /* Checklist */
        .checklist { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
        .check-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; margin-bottom: 5px; }
        .check-done { color: #27ae60; }
        .check-pending { color: #e74c3c; }
        
        /* Board Indicator */
        .board-indicator { margin-top: 10px; padding: 8px 12px; background: rgba(155, 89, 182, 0.15); border-radius: 8px; border-left: 3px solid #9b59b6; }
        .board-indicator-text { font-size: 0.8rem; color: #9b59b6; }
        
        /* Modal */
        .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
        .modal-content { background: linear-gradient(135deg, #2c3e50, #1a1a2e); border-radius: 20px; padding: 30px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; }
        .close-btn { position: absolute; top: 15px; right: 20px; font-size: 1.5rem; cursor: pointer; color: #bdc3c7; }
        .close-btn:hover { color: #e74c3c; }
        .modal-header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .modal-name { font-size: 1.8rem; margin-bottom: 5px; }
        .modal-email { color: #bdc3c7; font-size: 0.9rem; }
        .modal-contact { color: #3498db; font-size: 0.9rem; margin-top: 3px; }
        
        /* Detail Section */
        .detail-section { margin-bottom: 20px; }
        .detail-title { font-size: 1rem; font-weight: 600; color: #f1c40f; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .detail-title svg { width: 18px; height: 18px; fill: #f1c40f; }
        .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .detail-card { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 15px; }
        .detail-card.full-width { grid-column: 1 / -1; }
        .detail-label { font-size: 0.75rem; color: #95a5a6; margin-bottom: 5px; }
        .detail-value { font-size: 0.95rem; color: #ecf0f1; }
        
        /* Meeting Details */
        .meeting-list { max-height: 200px; overflow-y: auto; }
        .meeting-item { padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 5px; margin-bottom: 5px; font-size: 0.85rem; }
        .meeting-date { color: #3498db; font-weight: 600; }
        .meeting-type { color: #bdc3c7; margin-left: 10px; }
        
        /* Report Section */
        .report-section { display: none; }
        .report-section.active { display: block; }
        .report-card { background: rgba(255,255,255,0.08); border-radius: 15px; padding: 25px; margin-bottom: 20px; border-left: 4px solid #9b59b6; }
        .report-title { font-size: 1.3rem; margin-bottom: 15px; color: #f1c40f; }
        .report-description { color: #bdc3c7; margin-bottom: 20px; font-size: 0.9rem; }
        .report-controls { display: flex; gap: 15px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; }
        .report-table { width: 100%; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
        .report-table table { width: 100%; border-collapse: collapse; }
        .report-table th { background: rgba(155, 89, 182, 0.3); padding: 12px; text-align: left; font-size: 0.85rem; }
        .report-table td { padding: 10px 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem; }
        .report-table tr:hover { background: rgba(255,255,255,0.05); }
        
        /* Print Styles */
        @media print {
            body { background: white; color: black; }
            .controls, .tabs, .export-btn, .card-action-btn { display: none; }
            .member-card { page-break-inside: avoid; border: 1px solid #ddd; background: white; color: black; }
        }
        
        /* Hide/Show utilities */
        .hidden { display: none !important; }
        
        /* Loading spinner */
        .spinner { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; margin-left: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>⭐ RCUG Member Progress Dashboard</h1>
            <p class="subtitle">Rotaract Club of University of Guyana | Track Member & Guest Progress</p>
            <p id="lastUpdated" class="subtitle" style="margin-top:5px;"></p>
        </header>
        
        <div id="loadingMessage" class="loading">
            <div>⏳ Loading dashboard data...</div>
            <div style="font-size:0.8rem; margin-top:10px; color:#bdc3c7;">Fetching from Google Sheets</div>
        </div>
        
        <div id="errorMessage" class="error" style="display:none;"></div>
        
        <div id="mainContent" style="display:none;">
            <!-- Tabs -->
            <div class="tabs">
                <div class="tab members active" onclick="switchTab('members')">👥 Members</div>
                <div class="tab guests" onclick="switchTab('guests')">🎯 Guests</div>
                <div class="tab reports" onclick="switchTab('reports')">📊 Reports & Exports</div>
            </div>
            
            <!-- Members Section -->
            <div id="membersSection">
                <div class="controls">
                    <div class="control-row">
                        <input type="text" id="searchInput" class="search-input" placeholder="🔍 Search members...">
                        <select id="statusFilter" class="filter-select">
                            <option value="all">All Statuses</option>
                            <option value="good">Good Standing</option>
                            <option value="notgood">Not Good Standing</option>
                            <option value="terminated">Terminated</option>
                        </select>
                        <select id="periodFilter" class="filter-select">
                            <option value="h1">Half 1 (Q1 + Q2)</option>
                            <option value="q1">Quarter 1 (Jul-Sep)</option>
                            <option value="q2">Quarter 2 (Oct-Dec)</option>
                            <option value="q3">Quarter 3 (Jan-Mar)</option>
                            <option value="q4">Quarter 4 (Apr-Jun)</option>
                            <option value="h2">Half 2 (Q3 + Q4)</option>
                            <option value="annual">Annual (Full Year)</option>
                            <option value="elections">Elections Period</option>
                        </select>
                        <button class="refresh-btn" onclick="loadAllData()">🔄 Refresh</button>
                    </div>
                </div>
                
                <div class="stats-bar">
                    <div class="stat-box">
                        <div class="stat-value" id="totalMembers">0</div>
                        <div class="stat-label">Total Members</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="goodStanding">0</div>
                        <div class="stat-label">Good Standing</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="needsWork">0</div>
                        <div class="stat-label">Needs Work</div>
                    </div>
                </div>
                
                <div id="memberGrid" class="member-grid"></div>
            </div>
            
            <!-- Guests Section -->
            <div id="guestsSection" style="display:none;">
                <div class="controls">
                    <div class="control-row">
                        <input type="text" id="guestSearchInput" class="search-input" placeholder="🔍 Search guests...">
                        <select id="guestStatusFilter" class="filter-select">
                            <option value="all">All Guests</option>
                            <option value="eligible">Eligible for Membership</option>
                            <option value="notug">Not UG</option>
                            <option value="needsinfo">Needs Info Session</option>
                        </select>
                        <button class="refresh-btn" onclick="loadAllData()">🔄 Refresh</button>
                    </div>
                </div>
                
                <div class="stats-bar">
                    <div class="stat-box">
                        <div class="stat-value" id="totalGuests">0</div>
                        <div class="stat-label">Total Guests</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="eligibleGuests">0</div>
                        <div class="stat-label">Eligible for Membership</div>
                    </div>
                </div>
                
                <div id="guestGrid" class="member-grid"></div>
            </div>
            
            <!-- Reports Section -->
            <div id="reportsSection" class="report-section">
                <!-- Birthday Report -->
                <div class="report-card">
                    <h2 class="report-title">🎂 Birthday Report</h2>
                    <p class="report-description">Generate monthly birthday lists for Public Image posts</p>
                    <div class="report-controls">
                        <select id="birthdayMonthFilter" class="filter-select">
                            <option value="">Select Month...</option>
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                        <button class="export-btn" onclick="generateBirthdayPDF()" id="birthdayExportBtn" disabled>�„ Export PDF</button>
                    </div>
                    <div id="birthdayReportTable" class="report-table"></div>
                </div>
                
                <!-- Anniversary Report -->
                <div class="report-card">
                    <h2 class="report-title">🎉 Induction Anniversary Report</h2>
                    <p class="report-description">Generate monthly anniversary lists for Public Image posts</p>
                    <div class="report-controls">
                        <select id="anniversaryMonthFilter" class="filter-select">
                            <option value="">Select Month...</option>
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                        <button class="export-btn" onclick="generateAnniversaryPDF()" id="anniversaryExportBtn" disabled>�„ Export PDF</button>
                    </div>
                    <div id="anniversaryReportTable" class="report-table"></div>
                </div>
                
                <!-- Quarterly Attendance Report -->
                <div class="report-card">
                    <h2 class="report-title">⚠️ Quarterly Attendance Warning Report</h2>
                    <p class="report-description">Members below 60% attendance threshold (Bylaws Section 9)</p>
                    <div class="report-controls">
                        <select id="quarterFilter" class="filter-select">
                            <option value="q1">Quarter 1 (Jul-Sep)</option>
                            <option value="q2">Quarter 2 (Oct-Dec)</option>
                            <option value="q3">Quarter 3 (Jan-Mar)</option>
                            <option value="q4">Quarter 4 (Apr-Jun)</option>
                            <option value="h1">Half 1 (Q1 + Q2)</option>
                            <option value="h2">Half 2 (Q3 + Q4)</option>
                            <option value="annual">Annual (Full Year)</option>
                        </select>
                        <button class="export-btn" onclick="generateAttendanceWarningPDF()">�„ Export PDF</button>
                        <button class="export-btn" onclick="generateAttendanceWarningCSV()">📊 Export CSV</button>
                    </div>
                    <div id="attendanceWarningTable" class="report-table"></div>
                </div>
                
                <!-- Guest Eligibility Report -->
                <div class="report-card">
                    <h2 class="report-title">⭐ Guest Eligibility Report</h2>
                    <p class="report-description">Guests who have met membership requirements and are ready for proposal</p>
                    <div class="report-controls">
                        <button class="export-btn" onclick="generateGuestEligibilityPDF()">�„ Export PDF</button>
                        <button class="export-btn" onclick="generateGuestEligibilityCSV()">📊 Export CSV</button>
                    </div>
                    <div id="guestEligibilityTable" class="report-table"></div>
                </div>
            </div>
        </div>
        
        <!-- Member Detail Modal -->
        <div id="memberModal" class="modal" onclick="closeModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <span class="close-btn" onclick="closeModal()">&times;</span>
                <div id="modalContent"></div>
            </div>
        </div>
    </div>

    <script>
        const SHEET_ID = '1j0uOvYCe-DvOsPjxyb7RfLm7ddeB_LL99cJKeO40RaM';
        const GUEST_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&gid=1284804990\`;
        const MEMBER_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&gid=1821690489\`;
        const BOARD_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&gid=419776584\`;
        const ATTENDANCE_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&gid=1315129184\`;
        
        const TOTALS = { 
            q1: { meetings: 6, projects: 5 },
            q2: { meetings: 4, projects: 5 },
            q3: { meetings: 0, projects: 0 },
            q4: { meetings: 0, projects: 0 },
            h1: { meetings: 10, projects: 10 },
            h2: { meetings: 0, projects: 0 },
            annual: { meetings: 10, projects: 10 },
            elections: { meetings: 3, projects: 0 } 
        };
        const NEW_MEMBERS_DEC7 = ['Brittany Ross', 'Patrick Bacchus', 'Randolph Benn'];
        const BOARD_MEMBERS = ['Adanna Edwards', 'Andrew Hing', 'Christine Samuels', 'Darin Hall', 'Ganesh Anand', 'Jemima Stephenson', 'Kadeem Bowen', 'Nandita Singh', 'Omari London', 'Ruth Manbodh', 'Vishal Roopnarine', 'Yushina Ramlall'];
        
        let members = [], guests = [], allAttendance = [], boardAttendance = {}, currentTab = 'members', currentPeriod = 'h1';
        
        // Data Loading Functions
        async function fetchCSV(url, name) {
            const response = await fetch(url);
            if (!response.ok) throw new Error(\`\${name}: HTTP \${response.status}\`);
            const text = await response.text();
            return new Promise(resolve => { Papa.parse(text, { header: false, skipEmptyLines: true, complete: r => resolve(r.data) }); });
        }
        
        async function loadAllData() {
            document.getElementById('loadingMessage').style.display = 'block';
            document.getElementById('mainContent').style.display = 'none';
            document.getElementById('errorMessage').style.display = 'none';
            try {
                console.log('Loading data from Google Sheets...');
                const [guestData, memberData, boardData, attData] = await Promise.all([
                    fetchCSV(GUEST_URL, 'Guests').catch(e => { console.error('Guest data error:', e); return []; }),
                    fetchCSV(MEMBER_URL, 'Members').catch(e => { console.error('Member data error:', e); return []; }),
                    fetchCSV(BOARD_URL, 'Board').catch(e => { console.error('Board data error:', e); return []; }),
                    fetchCSV(ATTENDANCE_URL, 'Attendance').catch(e => { console.error('Attendance data error:', e); return []; })
                ]);
                
                if (memberData.length === 0) throw new Error('Could not load member data');
                
                processAttendance(attData);
                processBoard(boardData);
                processGuests(guestData);
                processMembers(memberData);
                linkNewMembersData();
                calculateMemberStats();
                
                // DEBUG: Log data to console
                console.log('=== DEBUG INFO ===');
                console.log('All Attendance records:', allAttendance.length);
                console.log('Sample attendance (first 5):', allAttendance.slice(0, 5));
                console.log('Unique meeting types:', [...new Set(allAttendance.map(a => a.type))]);
                console.log('Unique quarters:', [...new Set(allAttendance.map(a => a.quarter))]);
                console.log('Members loaded:', members.length);
                console.log('Andrew attendance:', allAttendance.filter(a => a.name && a.name.includes('Andrew')));
                const andrewDebug = members.find(m => m.fullName && m.fullName.includes('Andrew'));
                if (andrewDebug) {
                    console.log('Andrew member object meetings:', andrewDebug.meetings);
                }
                console.log('=== END DEBUG ===');
                
                if (members.length === 0) throw new Error('No members found after processing.');
                
                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                document.getElementById('lastUpdated').textContent = 'Updated: ' + new Date().toLocaleString();
                
                updateFilters();
                render();
                updateReports();
            } catch (error) {
                console.error('Load error:', error);
                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('errorMessage').style.display = 'block';
                document.getElementById('errorMessage').innerHTML = \`<h3>⚠️ Error Loading Data</h3><p>\${error.message}</p><p style="margin-top:15px;">Make sure your Google Sheet sharing is set to "Anyone with the link"</p><p><a href="https://docs.google.com/spreadsheets/d/\${SHEET_ID}/edit" target="_blank">Open Google Sheet</a></p>\`;
            }
        }
        
        function processAttendance(data) {
            allAttendance = [];
            if (!data.length) return;
            const hdr = data.findIndex(r => r[0] === 'Full Name');
            for (let i = (hdr >= 0 ? hdr : 2) + 1; i < data.length; i++) {
                const r = data[i];
                if (!r[0]) continue;
                let dateStr = r[6], meetingType = r[7], quarter = r[9];
                let month = null, dateKey = null;
                if (dateStr) {
                    const d = new Date(dateStr);
                    if (!isNaN(d)) {
                        month = d.getMonth() + 1;
                        dateKey = d.toISOString().split('T')[0];
                    }
                }
                allAttendance.push({ name: r[0].trim(), type: (meetingType || '').toString().trim(), month, quarter: (quarter || '').toString().trim(), dateKey });
            }
        }
        
        function processBoard(data) {
            boardAttendance = {};
            if (!data.length) return;
            let currentQuarter = 0;
            for (let i = 0; i < data.length; i++) {
                const r = data[i];
                if (r[0] && r[0].includes('QUARTER BOARD MEETING')) { currentQuarter++; continue; }
                if (r[0] === 'First Name' || !r[0] || r[0] === 'Total') continue;
                const name = \`\${(r[0] || '').trim()} \${(r[1] || '').trim()}\`.trim();
                if (!name || name === ' ') continue;
                if (!boardAttendance[name]) boardAttendance[name] = { total: 0, q1: 0, q2: 0, q3: 0, q4: 0 };
                let qTotal = 0;
                for (let j = 2; j <= 4; j++) if (r[j] == 1 || r[j] === '1') qTotal++;
                if (currentQuarter === 1) boardAttendance[name].q1 = qTotal;
                else if (currentQuarter === 2) boardAttendance[name].q2 = qTotal;
                else if (currentQuarter === 3) boardAttendance[name].q3 = qTotal;
                else if (currentQuarter === 4) boardAttendance[name].q4 = qTotal;
                boardAttendance[name].total = boardAttendance[name].q1 + boardAttendance[name].q2 + boardAttendance[name].q3 + boardAttendance[name].q4;
            }
        }
        
        function processGuests(data) {
            guests = [];
            if (!data.length) return;
            const hdr = data.findIndex(r => r[0] === 'First Name');
            const map = new Map();
            for (let i = (hdr >= 0 ? hdr : 1) + 1; i < data.length; i++) {
                const r = data[i];
                if (!r[0] || r[0] === 'First Name' || r[0] === 'NaN') continue;
                const name = \`\${(r[0]||'').trim()} \${(r[1]||'').trim()}\`.trim();
                if (!name || name === 'NaN NaN') continue;
                if (NEW_MEMBERS_DEC7.includes(name)) continue;
                let g = map.get(name);
                if (!g) {
                    g = { fullName: name, firstName: r[0], lastName: r[1], status: '', meetings: 0, projects: 0, info: false, committee: false, ug: false };
                    map.set(name, g);
                }
                for (let j = 3; j <= 8; j++) if (r[j] == 1 || r[j] === 'TRUE' || r[j] === '1') g.meetings++;
                for (let j = 12; j <= 22; j++) if (r[j] == 1 || r[j] === 'TRUE' || r[j] === '1') g.projects++;
                if (r[24] === 'TRUE' || r[24] == 1 || r[24] === '1' || r[24] === true) g.info = true;
                if (r[25] === 'TRUE' || r[25] == 1 || r[25] === '1' || r[25] === true) g.committee = true;
                if (r[26] === 'TRUE' || r[26] == 1 || r[26] === '1' || r[26] === true) g.ug = true;
                if (r[2] && r[2] !== g.status) g.status = r[2];
            }
            map.forEach(g => {
                g.meetings = Math.min(g.meetings, TOTALS.h1.meetings);
                g.projects = Math.min(g.projects, TOTALS.h1.projects);
                g.meetPct = (g.meetings / TOTALS.h1.meetings) * 100;
                g.projPct = (g.projects / TOTALS.h1.projects) * 100;
                guests.push(g);
            });
        }
        
        function formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            const d = new Date(dateStr);
            if (isNaN(d)) return 'N/A';
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return \`\${d.getDate()} \${months[d.getMonth()]} \${d.getFullYear()}\`;
        }
        
        function calculateAge(dateStr) {
            if (!dateStr) return null;
            const birthDate = new Date(dateStr);
            if (isNaN(birthDate)) return null;
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            return age;
        }
        
        function getMonthFromDate(dateStr) {
            if (!dateStr) return null;
            const d = new Date(dateStr);
            return isNaN(d) ? null : d.getMonth() + 1;
        }
        
        function getYearsOfService(dateStr) {
            if (!dateStr) return null;
            const inducted = new Date(dateStr);
            if (isNaN(inducted)) return null;
            const today = new Date();
            let years = today.getFullYear() - inducted.getFullYear();
            const m = today.getMonth() - inducted.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < inducted.getDate())) years--;
            return years;
        }
        
        function processMembers(data) {
            members = [];
            if (!data.length) return;
            
            let hdr = -1;
            for (let i = 0; i < Math.min(10, data.length); i++) {
                if (data[i][0] === 'ID' || (data[i][1] && data[i][1].toString().includes('Full Name'))) {
                    hdr = i;
                    break;
                }
            }
            
            if (hdr === -1) return;
            
            for (let i = hdr + 1; i < data.length; i++) {
                const r = data[i];
                if (!r[1] || r[1] === 'Full Name' || r[1] === '') continue;
                
                const name = r[1].toString().trim();
                if (!name) continue;
                
                const isNewDec7 = NEW_MEMBERS_DEC7.includes(name);
                const isBoardMember = BOARD_MEMBERS.includes(name);
                const registryStatus = (r[10] || '').toString().trim();
                const isTerminated = registryStatus.toLowerCase().includes('terminated');
                
                members.push({
                    fullName: name, 
                    firstName: (r[2] || '').toString().trim(), 
                    lastName: (r[3] || '').toString().trim(), 
                    email: (r[4] || '').toString().trim(),
                    contact: (r[5] || '').toString().trim(),
                    dateOfBirth: r[6] || '',
                    age: calculateAge(r[6]),
                    dateInducted: r[7] || '',
                    category: (r[8] || 'Rotaractor').toString().trim(),
                    ugStatus: (r[9] || '').toString().trim(),
                    education: (r[11] || '').toString().trim(),
                    profession: (r[12] || '').toString().trim(),
                    armsOfService: (r[13] || '').toString().trim(),
                    positionsHeld: (r[14] || '').toString().trim(),
                    incomingPosition: (r[15] || '').toString().trim(),
                    talentsHobbies: (r[16] || '').toString().trim(),
                    isNewDec7, 
                    isBoardMember, 
                    isTerminated,
                    meetings: { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0, annual: 0, elections: 0 },
                    projects: { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0, annual: 0, elections: 0 },
                    meetingDetails: { q1: [], q2: [], q3: [], q4: [], h1: [], h2: [], annual: [], elections: [] },
                    missedMeetings: { q1: [], q2: [], q3: [], q4: [], h1: [], h2: [], annual: [], elections: [] },
                    boardMeetings: isBoardMember && boardAttendance[name] ? boardAttendance[name] : null
                });
            }
        }
        
        function linkNewMembersData() {
            NEW_MEMBERS_DEC7.forEach(name => {
                const member = members.find(m => m.fullName === name);
                const guest = guests.find(g => g.fullName === name);
                if (member && guest) {
                    member.meetings.q1 = guest.meetings;
                    member.projects.q1 = guest.projects;
                    member.meetings.h1 = guest.meetings;
                    member.projects.h1 = guest.projects;
                }
            });
        }
        
        function calculateMemberStats() {
            members.forEach(m => {
                ['q1', 'q2', 'q3', 'q4', 'h1', 'h2', 'annual', 'elections'].forEach(p => {
                    const att = allAttendance.filter(a => {
                        if (a.name !== m.fullName) return false;
                        if (p === 'elections') return a.quarter === 'Elections Period';
                        if (p === 'h1') return a.quarter === 'Q1' || a.quarter === 'Q2';
                        if (p === 'h2') return a.quarter === 'Q3' || a.quarter === 'Q4';
                        if (p === 'annual') return ['Q1', 'Q2', 'Q3', 'Q4'].includes(a.quarter);
                        return a.quarter === p.toUpperCase();
                    });
                    m.meetings[p] = att.filter(a => a.type === 'Business Meeting' || a.type === 'Fellowship Meeting').length;
                    m.projects[p] = att.filter(a => a.type === 'Project').length;
                    m.meetingDetails[p] = att.filter(a => a.type === 'Business Meeting' || a.type === 'Fellowship Meeting').map(a => ({ date: a.dateKey, type: a.type }));
                    
                    const allMeetingDates = allAttendance.filter(a => {
                        const isRegularMeeting = a.type === 'Business Meeting' || a.type === 'Fellowship Meeting';
                        if (p === 'elections') return isRegularMeeting && a.quarter === 'Elections Period';
                        if (p === 'h1') return isRegularMeeting && (a.quarter === 'Q1' || a.quarter === 'Q2');
                        if (p === 'h2') return isRegularMeeting && (a.quarter === 'Q3' || a.quarter === 'Q4');
                        if (p === 'annual') return isRegularMeeting && ['Q1', 'Q2', 'Q3', 'Q4'].includes(a.quarter);
                        return isRegularMeeting && a.quarter === p.toUpperCase();
                    }).map(a => a.dateKey).filter((v, i, a) => a.indexOf(v) === i);
                    
                    const attendedDates = new Set(m.meetingDetails[p].map(md => md.date));
                    m.missedMeetings[p] = allMeetingDates.filter(d => !attendedDates.has(d));
                });
            });
        }
        
        // UI Functions
        function switchTab(tab) {
            currentTab = tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector(\`.tab.\${tab}\`).classList.add('active');
            
            document.getElementById('membersSection').style.display = tab === 'members' ? 'block' : 'none';
            document.getElementById('guestsSection').style.display = tab === 'guests' ? 'block' : 'none';
            document.getElementById('reportsSection').classList.toggle('active', tab === 'reports');
            
            if (tab === 'reports') updateReports();
            else render();
        }
        
        function updateFilters() {
            const periodFilter = document.getElementById('periodFilter');
            if (periodFilter) {
                periodFilter.addEventListener('change', (e) => {
                    currentPeriod = e.target.value;
                    render();
                });
            }
            
            const statusFilter = document.getElementById('statusFilter');
            if (statusFilter) statusFilter.addEventListener('change', render);
            
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.addEventListener('input', render);
            
            const guestStatusFilter = document.getElementById('guestStatusFilter');
            if (guestStatusFilter) guestStatusFilter.addEventListener('change', render);
            
            const guestSearchInput = document.getElementById('guestSearchInput');
            if (guestSearchInput) guestSearchInput.addEventListener('input', render);
            
            // Report filters
            const birthdayMonth = document.getElementById('birthdayMonthFilter');
            if (birthdayMonth) birthdayMonth.addEventListener('change', updateBirthdayReport);
            
            const anniversaryMonth = document.getElementById('anniversaryMonthFilter');
            if (anniversaryMonth) anniversaryMonth.addEventListener('change', updateAnniversaryReport);
            
            const quarterFilter = document.getElementById('quarterFilter');
            if (quarterFilter) quarterFilter.addEventListener('change', updateAttendanceWarningReport);
        }
        
        function render() {
            if (currentTab === 'members') renderMembers();
            else if (currentTab === 'guests') renderGuests();
        }
        
        function renderMembers() {
            const statusFilter = document.getElementById('statusFilter').value;
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            let filtered = members.filter(m => {
                if (statusFilter === 'good' && !isGoodStanding(m)) return false;
                if (statusFilter === 'notgood' && isGoodStanding(m)) return false;
                if (statusFilter === 'terminated' && !m.isTerminated) return false;
                if (searchTerm && !m.fullName.toLowerCase().includes(searchTerm)) return false;
                return true;
            });
            
            // Update stats
            document.getElementById('totalMembers').textContent = members.filter(m => !m.isTerminated).length;
            document.getElementById('goodStanding').textContent = members.filter(m => !m.isTerminated && isGoodStanding(m)).length;
            document.getElementById('needsWork').textContent = members.filter(m => !m.isTerminated && !isGoodStanding(m)).length;
            
            const grid = document.getElementById('memberGrid');
            grid.innerHTML = filtered.map(m => renderMemberCard(m)).join('');
        }
        
        function isGoodStanding(m) {
            if (m.isTerminated) return false;
            const pct = (m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100;
            return pct >= 60;
        }
        
        function renderMemberCard(m) {
            const pct = (m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100;
            const projPct = (m.projects[currentPeriod] / TOTALS[currentPeriod].projects) * 100;
            
            let statusClass = 'good', statusText = 'Good Standing';
            if (m.isTerminated) { statusClass = 'terminated'; statusText = 'Terminated'; }
            else if (pct < 60) { statusClass = 'notgood'; statusText = 'Not Good Standing'; }
            
            const badges = [];
            if (m.isNewDec7) badges.push('<span class="badge badge-new">NEW</span>');
            if (m.isBoardMember) badges.push('<span class="badge badge-board">BOARD</span>');
            if (m.isTerminated) badges.push('<span class="badge badge-terminated">TERMINATED</span>');
            
            let boardSection = '';
            if (m.isBoardMember && m.boardMeetings) {
                let bp, btotal;
                if (currentPeriod === 'h1') { bp = (m.boardMeetings.q1 || 0) + (m.boardMeetings.q2 || 0); btotal = 6; }
                else if (currentPeriod === 'h2') { bp = (m.boardMeetings.q3 || 0) + (m.boardMeetings.q4 || 0); btotal = 6; }
                else if (currentPeriod === 'annual') { bp = (m.boardMeetings.total || 0); btotal = 12; }
                else { bp = (m.boardMeetings[currentPeriod] || 0); btotal = 3; }
                boardSection = \`
                    <div class="progress-row">
                        <span class="progress-label">Board Mtgs</span>
                        <div class="progress-bar">
                            <div class="progress-fill board" style="width: \${(bp/btotal)*100}%"></div>
                        </div>
                        <span class="progress-value">\${bp}/\${btotal} (\${Math.round((bp/btotal)*100)}%)</span>
                    </div>
                \`;
            }
            
            return \`
                <div class="member-card \${statusClass}" onclick="showMemberDetails('\${m.fullName.replace(/'/g, "\\\\'")}')">
                    <div class="card-actions">
                        <button class="card-action-btn" onclick="event.stopPropagation(); exportMemberCard('\${m.fullName.replace(/'/g, "\\\\'")}')">�„ Export</button>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="member-name">\${m.fullName} \${badges.join('')}</div>
                            <div class="member-tag">\${m.category}</div>
                        </div>
                        <span class="status-badge status-\${statusClass}">\${statusText}</span>
                    </div>
                    <div class="progress-row">
                        <span class="progress-label">Meetings</span>
                        <div class="progress-bar">
                            <div class="progress-fill meetings" style="width: \${pct}%"></div>
                        </div>
                        <span class="progress-value">\${m.meetings[currentPeriod]}/\${TOTALS[currentPeriod].meetings} (\${Math.round(pct)}%)</span>
                    </div>
                    <div class="progress-row">
                        <span class="progress-label">Projects</span>
                        <div class="progress-bar">
                            <div class="progress-fill projects" style="width: \${projPct}%"></div>
                        </div>
                        <span class="progress-value">\${m.projects[currentPeriod]}/\${TOTALS[currentPeriod].projects} (\${Math.round(projPct)}%)</span>
                    </div>
                    \${boardSection}
                </div>
            \`;
        }
        
        function renderGuests() {
            const statusFilter = document.getElementById('guestStatusFilter').value;
            const searchTerm = document.getElementById('guestSearchInput').value.toLowerCase();
            
            let filtered = guests.filter(g => {
                if (statusFilter === 'eligible' && !isEligible(g)) return false;
                if (statusFilter === 'notug' && g.ug) return false;
                if (statusFilter === 'needsinfo' && g.info) return false;
                if (searchTerm && !g.fullName.toLowerCase().includes(searchTerm)) return false;
                return true;
            });
            
            document.getElementById('totalGuests').textContent = guests.length;
            document.getElementById('eligibleGuests').textContent = guests.filter(isEligible).length;
            
            const grid = document.getElementById('guestGrid');
            grid.innerHTML = filtered.map(g => renderGuestCard(g)).join('');
        }
        
        function isEligible(g) {
            return g.meetings >= 3 && g.projects >= 2 && g.info && g.committee && g.ug;
        }
        
        function renderGuestCard(g) {
            const eligible = isEligible(g);
            const statusClass = eligible ? 'eligible' : g.ug ? 'guest' : 'notug';
            const statusText = eligible ? '✅ Eligible' : !g.info ? '� Info Session Needed' : !g.ug ? '❌ Not UG' : '⏳ In Progress';
            
            return \`
                <div class="member-card \${statusClass}">
                    <div class="card-header">
                        <div>
                            <div class="member-name">\${g.fullName}</div>
                            <div class="member-tag">Guest</div>
                        </div>
                        <span class="status-badge status-\${statusClass.replace('guest', 'infosession')}">\${statusText}</span>
                    </div>
                    <div class="progress-row">
                        <span class="progress-label">Meetings</span>
                        <div class="progress-bar">
                            <div class="progress-fill meetings" style="width: \${g.meetPct}%"></div>
                        </div>
                        <span class="progress-value">\${g.meetings}/\${TOTALS.h1.meetings} (\${Math.round(g.meetPct)}%)</span>
                    </div>
                    <div class="progress-row">
                        <span class="progress-label">Projects</span>
                        <div class="progress-bar">
                            <div class="progress-fill projects" style="width: \${g.projPct}%"></div>
                        </div>
                        <span class="progress-value">\${g.projects}/\${TOTALS.h1.projects} (\${Math.round(g.projPct)}%)</span>
                    </div>
                    <div class="checklist">
                        <div class="check-item \${g.meetings >= 3 ? 'check-done' : 'check-pending'}">\${g.meetings >= 3 ? '✅' : '❌'} 3+ Business Meetings</div>
                        <div class="check-item \${g.projects >= 2 ? 'check-done' : 'check-pending'}">\${g.projects >= 2 ? '✅' : '❌'} 2+ Projects</div>
                        <div class="check-item \${g.info ? 'check-done' : 'check-pending'}">\${g.info ? '✅' : '❌'} Info Session</div>
                        <div class="check-item \${g.committee ? 'check-done' : 'check-pending'}">\${g.committee ? '✅' : '❌'} Committee Meeting</div>
                        <div class="check-item \${g.ug ? 'check-done' : 'check-pending'}">\${g.ug ? '✅' : '❌'} UG Student/Graduate</div>
                    </div>
                </div>
            \`;
        }
        
        // Modal Functions
        function showMemberDetails(name) {
            const m = members.find(mem => mem.fullName === name);
            if (!m) return;
            
            const modal = document.getElementById('memberModal');
            const content = document.getElementById('modalContent');
            
            const attendedList = m.meetingDetails[currentPeriod].map(md => 
                \`<div class="meeting-item"><span class="meeting-date">\${md.date}</span><span class="meeting-type">\${md.type}</span></div>\`
            ).join('') || '<div style="color:#95a5a6;">No meetings attended</div>';
            
            const missedList = m.missedMeetings[currentPeriod].map(date => 
                \`<div class="meeting-item" style="color:#e74c3c;"><span class="meeting-date">\${date}</span><span class="meeting-type">Missed</span></div>\`
            ).join('') || '<div style="color:#27ae60;">No meetings missed</div>';
            
            let boardSection = '';
            if (m.isBoardMember && m.boardMeetings) {
                boardSection = \`
                    <div class="detail-section">
                        <div class="detail-title">
                            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                            Board Meeting Attendance
                        </div>
                        <div class="detail-grid">
                            <div class="detail-card">
                                <div class="detail-label">Q1</div>
                                <div class="detail-value">\${m.boardMeetings.q1}/3</div>
                            </div>
                            <div class="detail-card">
                                <div class="detail-label">Q2</div>
                                <div class="detail-value">\${m.boardMeetings.q2}/3</div>
                            </div>
                            <div class="detail-card">
                                <div class="detail-label">Total</div>
                                <div class="detail-value">\${m.boardMeetings.total}/6</div>
                            </div>
                        </div>
                    </div>
                \`;
            }
            
            content.innerHTML = \`
                <div class="modal-header">
                    <div class="modal-name">\${m.fullName}</div>
                    <div class="modal-email">\${m.email || 'No email on file'}</div>
                    \${m.contact ? \`<div class="modal-contact">�ž \${m.contact}</div>\` : ''}
                </div>
                
                <div class="detail-section">
                    <div class="detail-title">
                        <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        Personal Information
                    </div>
                    <div class="detail-grid">
                        <div class="detail-card">
                            <div class="detail-label">Birthday</div>
                            <div class="detail-value">\${formatDate(m.dateOfBirth)} \${m.age ? \`(Age \${m.age})\` : ''}</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">Date Inducted</div>
                            <div class="detail-value">\${formatDate(m.dateInducted)}</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">Category</div>
                            <div class="detail-value">\${m.category}</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">UG Status</div>
                            <div class="detail-value">\${m.ugStatus || 'N/A'}</div>
                        </div>
                        <div class="detail-card full-width">
                            <div class="detail-label">Education</div>
                            <div class="detail-value">\${m.education || 'N/A'}</div>
                        </div>
                        <div class="detail-card full-width">
                            <div class="detail-label">Profession</div>
                            <div class="detail-value">\${m.profession || 'N/A'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <div class="detail-title">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        Rotaract Involvement
                    </div>
                    <div class="detail-grid">
                        <div class="detail-card full-width">
                            <div class="detail-label">Arms of Service</div>
                            <div class="detail-value">\${m.armsOfService || 'N/A'}</div>
                        </div>
                        <div class="detail-card full-width">
                            <div class="detail-label">Positions Held</div>
                            <div class="detail-value">\${m.positionsHeld || 'N/A'}</div>
                        </div>
                        <div class="detail-card full-width">
                            <div class="detail-label">Incoming Position (2025-26)</div>
                            <div class="detail-value">\${m.incomingPosition || 'N/A'}</div>
                        </div>
                        <div class="detail-card full-width">
                            <div class="detail-label">Talents & Hobbies</div>
                            <div class="detail-value">\${m.talentsHobbies || 'N/A'}</div>
                        </div>
                    </div>
                </div>
                
                \${boardSection}
                
                <div class="detail-section">
                    <div class="detail-title">
                        <svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                        Attendance Details (\${currentPeriod.toUpperCase()})
                    </div>
                    <div class="detail-grid">
                        <div class="detail-card">
                            <div class="detail-label">Meetings Attended</div>
                            <div class="meeting-list">\${attendedList}</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">Meetings Missed</div>
                            <div class="meeting-list">\${missedList}</div>
                        </div>
                    </div>
                </div>
            \`;
            
            modal.style.display = 'flex';
        }
        
        function closeModal(event) {
            if (!event || event.target.id === 'memberModal') {
                document.getElementById('memberModal').style.display = 'none';
            }
        }
        
        // Export Functions
        async function exportMemberCard(name) {
            const m = members.find(mem => mem.fullName === name);
            if (!m) return;
            
            // Show member in temporary printable div
            const printDiv = document.createElement('div');
            printDiv.style.cssText = 'position:fixed;left:-9999px;width:800px;padding:40px;background:white;color:black;';
            printDiv.innerHTML = \`
                <div style="text-align:center;margin-bottom:30px;">
                    <h1 style="color:#e91e63;margin:0;">Rotaract Club of University of Guyana</h1>
                    <h2 style="color:#666;margin:10px 0 0 0;">Member Attendance Report</h2>
                </div>
                <div style="border:2px solid #e91e63;border-radius:10px;padding:20px;">
                    <h2 style="margin-top:0;">\${m.fullName}</h2>
                    <p><strong>Email:</strong> \${m.email || 'N/A'}</p>
                    <p><strong>Contact:</strong> \${m.contact || 'N/A'}</p>
                    <p><strong>Category:</strong> \${m.category}</p>
                    <hr>
                    <h3>Attendance Summary (Half 1)</h3>
                    <p><strong>Meetings:</strong> \${m.meetings.h1}/\${TOTALS.h1.meetings} (\${Math.round((m.meetings.h1/TOTALS.h1.meetings)*100)}%)</p>
                    <p><strong>Projects:</strong> \${m.projects.h1}/\${TOTALS.h1.projects} (\${Math.round((m.projects.h1/TOTALS.h1.projects)*100)}%)</p>
                    \${m.isBoardMember && m.boardMeetings ? \`<p><strong>Board Meetings:</strong> \${m.boardMeetings.q1 + m.boardMeetings.q2}/6</p>\` : ''}
                    <hr>
                    <h3>Meetings Attended</h3>
                    <ul>\${m.meetingDetails.h1.map(md => \`<li>\${md.date} - \${md.type}</li>\`).join('') || '<li>None</li>'}</ul>
                    <h3>Meetings Missed</h3>
                    <ul>\${m.missedMeetings.h1.map(d => \`<li>\${d}</li>\`).join('') || '<li>None</li>'}</ul>
                </div>
                <div style="text-align:center;margin-top:20px;color:#666;font-size:12px;">
                    Generated: \${new Date().toLocaleString()}
                </div>
            \`;
            document.body.appendChild(printDiv);
            
            try {
                const canvas = await html2canvas(printDiv, { scale: 2, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/png');
                
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save(\`\${m.fullName.replace(/\s+/g, '_')}_Attendance_Card.pdf\`);
            } catch (error) {
                console.error('Export error:', error);
                alert('Error generating PDF. Please try again.');
            } finally {
                document.body.removeChild(printDiv);
            }
        }
        
        // Report Functions
        function updateReports() {
            updateBirthdayReport();
            updateAnniversaryReport();
            updateAttendanceWarningReport();
            updateGuestEligibilityReport();
        }
        
        function updateBirthdayReport() {
            const month = parseInt(document.getElementById('birthdayMonthFilter').value);
            const btn = document.getElementById('birthdayExportBtn');
            const table = document.getElementById('birthdayReportTable');
            
            if (!month) {
                btn.disabled = true;
                table.innerHTML = '<p style="text-align:center;color:#bdc3c7;padding:20px;">Select a month to view birthdays</p>';
                return;
            }
            
            const birthdays = members.filter(m => !m.isTerminated && getMonthFromDate(m.dateOfBirth) === month)
                .sort((a, b) => {
                    const aDay = new Date(a.dateOfBirth).getDate();
                    const bDay = new Date(b.dateOfBirth).getDate();
                    return aDay - bDay;
                });
            
            if (birthdays.length === 0) {
                btn.disabled = true;
                table.innerHTML = '<p style="text-align:center;color:#bdc3c7;padding:20px;">No birthdays this month</p>';
                return;
            }
            
            btn.disabled = false;
            table.innerHTML = \`
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Age</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${birthdays.map(m => \`
                            <tr>
                                <td>\${m.fullName}</td>
                                <td>\${formatDate(m.dateOfBirth)}</td>
                                <td>\${m.age || 'N/A'}</td>
                                <td>\${m.email || 'N/A'}</td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
            \`;
        }
        
        function updateAnniversaryReport() {
            const month = parseInt(document.getElementById('anniversaryMonthFilter').value);
            const btn = document.getElementById('anniversaryExportBtn');
            const table = document.getElementById('anniversaryReportTable');
            
            if (!month) {
                btn.disabled = true;
                table.innerHTML = '<p style="text-align:center;color:#bdc3c7;padding:20px;">Select a month to view anniversaries</p>';
                return;
            }
            
            const anniversaries = members.filter(m => !m.isTerminated && getMonthFromDate(m.dateInducted) === month)
                .sort((a, b) => {
                    const aDay = new Date(a.dateInducted).getDate();
                    const bDay = new Date(b.dateInducted).getDate();
                    return aDay - bDay;
                });
            
            if (anniversaries.length === 0) {
                btn.disabled = true;
                table.innerHTML = '<p style="text-align:center;color:#bdc3c7;padding:20px;">No anniversaries this month</p>';
                return;
            }
            
            btn.disabled = false;
            table.innerHTML = \`
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date Inducted</th>
                            <th>Years of Service</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${anniversaries.map(m => \`
                            <tr>
                                <td>\${m.fullName}</td>
                                <td>\${formatDate(m.dateInducted)}</td>
                                <td>\${getYearsOfService(m.dateInducted) || 0} years</td>
                                <td>\${m.email || 'N/A'}</td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
            \`;
        }
        
        function updateAttendanceWarningReport() {
            const period = document.getElementById('quarterFilter').value;
            const table = document.getElementById('attendanceWarningTable');
            
            const atRisk = members.filter(m => {
                if (m.isTerminated) return false;
                const pct = (m.meetings[period] / TOTALS[period].meetings) * 100;
                return pct < 60;
            }).sort((a, b) => {
                const aPct = (a.meetings[period] / TOTALS[period].meetings) * 100;
                const bPct = (b.meetings[period] / TOTALS[period].meetings) * 100;
                return aPct - bPct;
            });
            
            if (atRisk.length === 0) {
                table.innerHTML = '<p style="text-align:center;color:#27ae60;padding:20px;">✅ All members meet attendance requirements!</p>';
                return;
            }
            
            table.innerHTML = \`
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Meetings Attended</th>
                            <th>Attendance %</th>
                            <th>Projects</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${atRisk.map(m => {
                            const pct = Math.round((m.meetings[period] / TOTALS[period].meetings) * 100);
                            return \`
                                <tr>
                                    <td>\${m.fullName}</td>
                                    <td>\${m.meetings[period]}/\${TOTALS[period].meetings}</td>
                                    <td style="color:\${pct < 50 ? '#e74c3c' : '#e67e22'}">\${pct}%</td>
                                    <td>\${m.projects[period]}/\${TOTALS[period].projects}</td>
                                    <td>\${m.email || 'N/A'}</td>
                                </tr>
                            \`;
                        }).join('')}
                    </tbody>
                </table>
            \`;
        }
        
        function updateGuestEligibilityReport() {
            const table = document.getElementById('guestEligibilityTable');
            const eligible = guests.filter(isEligible);
            
            if (eligible.length === 0) {
                table.innerHTML = '<p style="text-align:center;color:#bdc3c7;padding:20px;">No guests currently eligible for membership</p>';
                return;
            }
            
            table.innerHTML = \`
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Meetings</th>
                            <th>Projects</th>
                            <th>Info Session</th>
                            <th>Committee</th>
                            <th>UG Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${eligible.map(g => \`
                            <tr>
                                <td>\${g.fullName}</td>
                                <td>\${g.meetings}/\${TOTALS.h1.meetings}</td>
                                <td>\${g.projects}/\${TOTALS.h1.projects}</td>
                                <td style="color:#27ae60">\${g.info ? '✅' : '❌'}</td>
                                <td style="color:#27ae60">\${g.committee ? '✅' : '❌'}</td>
                                <td style="color:#27ae60">\${g.ug ? '✅' : '❌'}</td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
            \`;
        }
        
        // PDF Export Functions
        async function generateBirthdayPDF() {
            const month = parseInt(document.getElementById('birthdayMonthFilter').value);
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const birthdays = members.filter(m => !m.isTerminated && getMonthFromDate(m.dateOfBirth) === month);
            
            if (birthdays.length === 0) return;
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            pdf.setFontSize(20);
            pdf.setTextColor(233, 30, 99);
            pdf.text('Rotaract Club of University of Guyana', 105, 20, { align: 'center' });
            
            pdf.setFontSize(16);
            pdf.setTextColor(100, 100, 100);
            pdf.text(\`\${monthNames[month]} Birthdays\`, 105, 30, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            
            let y = 45;
            birthdays.forEach(m => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.text(\`\${m.fullName}\`, 20, y);
                pdf.text(\`\${formatDate(m.dateOfBirth)}\`, 100, y);
                pdf.text(\`Age: \${m.age || 'N/A'}\`, 150, y);
                y += 7;
            });
            
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(\`Generated: \${new Date().toLocaleString()}\`, 105, 285, { align: 'center' });
            
            pdf.save(\`RCUG_Birthdays_\${monthNames[month]}_\${new Date().getFullYear()}.pdf\`);
        }
        
        async function generateAnniversaryPDF() {
            const month = parseInt(document.getElementById('anniversaryMonthFilter').value);
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const anniversaries = members.filter(m => !m.isTerminated && getMonthFromDate(m.dateInducted) === month);
            
            if (anniversaries.length === 0) return;
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            pdf.setFontSize(20);
            pdf.setTextColor(233, 30, 99);
            pdf.text('Rotaract Club of University of Guyana', 105, 20, { align: 'center' });
            
            pdf.setFontSize(16);
            pdf.setTextColor(100, 100, 100);
            pdf.text(\`\${monthNames[month]} Induction Anniversaries\`, 105, 30, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            
            let y = 45;
            anniversaries.forEach(m => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.text(\`\${m.fullName}\`, 20, y);
                pdf.text(\`\${formatDate(m.dateInducted)}\`, 100, y);
                pdf.text(\`\${getYearsOfService(m.dateInducted) || 0} years\`, 160, y);
                y += 7;
            });
            
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(\`Generated: \${new Date().toLocaleString()}\`, 105, 285, { align: 'center' });
            
            pdf.save(\`RCUG_Anniversaries_\${monthNames[month]}_\${new Date().getFullYear()}.pdf\`);
        }
        
        async function generateAttendanceWarningPDF() {
            const period = document.getElementById('quarterFilter').value;
            const atRisk = members.filter(m => {
                if (m.isTerminated) return false;
                const pct = (m.meetings[period] / TOTALS[period].meetings) * 100;
                return pct < 60;
            });
            
            if (atRisk.length === 0) {
                alert('No members below attendance threshold!');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            pdf.setFontSize(20);
            pdf.setTextColor(233, 30, 99);
            pdf.text('Rotaract Club of University of Guyana', 105, 20, { align: 'center' });
            
            pdf.setFontSize(16);
            pdf.setTextColor(231, 76, 60);
            pdf.text('Attendance Warning Report', 105, 30, { align: 'center' });
            
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.text(\`Period: \${period.toUpperCase()}\`, 105, 38, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            
            let y = 50;
            atRisk.forEach(m => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                const pct = Math.round((m.meetings[period] / TOTALS[period].meetings) * 100);
                pdf.text(\`\${m.fullName}\`, 20, y);
                pdf.text(\`\${m.meetings[period]}/\${TOTALS[period].meetings}\`, 120, y);
                pdf.setTextColor(pct < 50 ? 231 : 230, pct < 50 ? 76 : 126, pct < 50 ? 60 : 34);
                pdf.text(\`\${pct}%\`, 160, y);
                pdf.setTextColor(0, 0, 0);
                y += 7;
            });
            
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(\`Generated: \${new Date().toLocaleString()}\`, 105, 285, { align: 'center' });
            
            pdf.save(\`RCUG_Attendance_Warning_\${period.toUpperCase()}_\${new Date().getFullYear()}.pdf\`);
        }
        
        function generateAttendanceWarningCSV() {
            const period = document.getElementById('quarterFilter').value;
            const atRisk = members.filter(m => {
                if (m.isTerminated) return false;
                const pct = (m.meetings[period] / TOTALS[period].meetings) * 100;
                return pct < 60;
            });
            
            if (atRisk.length === 0) {
                alert('No members below attendance threshold!');
                return;
            }
            
            let csv = 'Name,Meetings Attended,Total Meetings,Attendance %,Projects,Email\\n';
            atRisk.forEach(m => {
                const pct = Math.round((m.meetings[period] / TOTALS[period].meetings) * 100);
                csv += \`"\${m.fullName}",\${m.meetings[period]},\${TOTALS[period].meetings},\${pct}%,\${m.projects[period]},"\${m.email || 'N/A'}"\\n\`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`RCUG_Attendance_Warning_\${period.toUpperCase()}_\${new Date().getFullYear()}.csv\`;
            a.click();
        }
        
        async function generateGuestEligibilityPDF() {
            const eligible = guests.filter(isEligible);
            
            if (eligible.length === 0) {
                alert('No guests currently eligible!');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            pdf.setFontSize(20);
            pdf.setTextColor(233, 30, 99);
            pdf.text('Rotaract Club of University of Guyana', 105, 20, { align: 'center' });
            
            pdf.setFontSize(16);
            pdf.setTextColor(155, 89, 182);
            pdf.text('Guest Eligibility Report', 105, 30, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            
            let y = 45;
            eligible.forEach(g => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.text(\`\${g.fullName}\`, 20, y);
                pdf.text(\`Mtgs: \${g.meetings}/\${TOTALS.h1.meetings}\`, 100, y);
                pdf.text(\`Proj: \${g.projects}/\${TOTALS.h1.projects}\`, 140, y);
                pdf.setTextColor(39, 174, 96);
                pdf.text('✓ Ready', 170, y);
                pdf.setTextColor(0, 0, 0);
                y += 7;
            });
            
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(\`Generated: \${new Date().toLocaleString()}\`, 105, 285, { align: 'center' });
            
            pdf.save(\`RCUG_Guest_Eligibility_\${new Date().getFullYear()}.pdf\`);
        }
        
        function generateGuestEligibilityCSV() {
            const eligible = guests.filter(isEligible);
            
            if (eligible.length === 0) {
                alert('No guests currently eligible!');
                return;
            }
            
            let csv = 'Name,Meetings,Projects,Info Session,Committee,UG Status\\n';
            eligible.forEach(g => {
                csv += \`"\${g.fullName}",\${g.meetings},\${g.projects},\${g.info ? 'Yes' : 'No'},\${g.committee ? 'Yes' : 'No'},\${g.ug ? 'Yes' : 'No'}\\n\`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`RCUG_Guest_Eligibility_\${new Date().getFullYear()}.csv\`;
            a.click();
        }
        
        // Initialize
        loadAllData();
    </script>
</body>
</html>
`;
