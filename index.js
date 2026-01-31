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
        .member-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
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
        .badge-onleave { background: #f39c12; color: #fff; }
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
        .status-onleave { background: #f39c12; }
        
        /* Progress Bars */
        .progress-section { margin-bottom: 12px; }
        .progress-section-title { font-size: 0.75rem; color: #f1c40f; margin-bottom: 8px; font-weight: 600; }
        .progress-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 0.85rem; }
        .progress-label { width: 110px; color: #bdc3c7; }
        .progress-bar { flex: 1; height: 10px; background: rgba(255,255,255,0.15); border-radius: 5px; overflow: hidden; margin: 0 10px; }
        .progress-fill { height: 100%; border-radius: 5px; transition: width 0.5s; }
        .progress-fill.meetings { background: linear-gradient(90deg, #3498db, #2980b9); }
        .progress-fill.committee { background: linear-gradient(90deg, #9b59b6, #8e44ad); }
        .progress-fill.combined { background: linear-gradient(90deg, #27ae60, #1e8449); }
        .progress-fill.projects { background: linear-gradient(90deg, #e74c3c, #c0392b); }
        .progress-fill.board { background: linear-gradient(90deg, #f39c12, #d68910); }
        .progress-value { width: 110px; text-align: right; font-weight: 600; font-size: 0.8rem; }
        
        /* Good Standing Indicator */
        .good-standing-box { background: rgba(39, 174, 96, 0.15); border: 1px solid rgba(39, 174, 96, 0.3); border-radius: 8px; padding: 10px; margin-top: 10px; }
        .good-standing-box.not-good { background: rgba(231, 76, 60, 0.15); border-color: rgba(231, 76, 60, 0.3); }
        .good-standing-title { font-size: 0.75rem; color: #95a5a6; margin-bottom: 5px; }
        .good-standing-value { font-size: 1.1rem; font-weight: 700; }
        .good-standing-value.good { color: #27ae60; }
        .good-standing-value.not-good { color: #e74c3c; }
        .good-standing-breakdown { font-size: 0.7rem; color: #95a5a6; margin-top: 5px; }
        
        /* Checklist */
        .checklist { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
        .check-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; margin-bottom: 5px; }
        .check-done { color: #27ae60; }
        .check-pending { color: #e74c3c; }
        
        /* Committee Tags */
        .committee-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
        .committee-tag { background: rgba(155, 89, 182, 0.3); color: #bb8fce; padding: 2px 8px; border-radius: 10px; font-size: 0.65rem; }
        
        /* Board Indicator */
        .board-indicator { margin-top: 10px; padding: 8px 12px; background: rgba(155, 89, 182, 0.15); border-radius: 8px; border-left: 3px solid #9b59b6; }
        .board-indicator-text { font-size: 0.8rem; color: #9b59b6; }
        
        /* Modal */
        .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; overflow-y: auto; }
        .modal-content { background: linear-gradient(135deg, #2c3e50, #1a1a2e); border-radius: 20px; padding: 30px; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; margin: auto; }
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
        .meeting-list { max-height: 300px; overflow-y: auto; }
        .meeting-item { padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 5px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center; }
        .meeting-item.attended { border-left: 3px solid #27ae60; }
        .meeting-item.missed { border-left: 3px solid #e74c3c; }
        .meeting-date { color: #3498db; font-weight: 600; font-size: 0.85rem; }
        .meeting-type { color: #bdc3c7; font-size: 0.8rem; }
        .meeting-name { color: #f1c40f; font-size: 0.75rem; margin-top: 2px; }
        .meeting-status { font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; }
        .meeting-status.attended { background: rgba(39, 174, 96, 0.3); color: #27ae60; }
        .meeting-status.missed { background: rgba(231, 76, 60, 0.3); color: #e74c3c; }
        
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
        
        /* Responsive */
        @media (max-width: 768px) {
            .member-grid { grid-template-columns: 1fr; }
            .detail-grid { grid-template-columns: 1fr; }
        }
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
                            <option value="onleave">On Leave</option>
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
                    <div class="stat-box">
                        <div class="stat-value" id="avgAttendance">0%</div>
                        <div class="stat-label">Avg Attendance</div>
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
                        <button class="export-btn" onclick="generateBirthdayPDF()" id="birthdayExportBtn" disabled>✨ Export PDF</button>
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
                        <button class="export-btn" onclick="generateAnniversaryPDF()" id="anniversaryExportBtn" disabled>✨ Export PDF</button>
                    </div>
                    <div id="anniversaryReportTable" class="report-table"></div>
                </div>
                
                <!-- Quarterly Attendance Report -->
                <div class="report-card">
                    <h2 class="report-title">⚠️ Quarterly Attendance Warning Report</h2>
                    <p class="report-description">Members below 60% attendance threshold (Bylaws Section 9) - Includes Regular + Committee Meetings</p>
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
                        <button class="export-btn" onclick="generateAttendanceWarningPDF()">✨ Export PDF</button>
                        <button class="export-btn" onclick="generateAttendanceWarningCSV()">📊 Export CSV</button>
                    </div>
                    <div id="attendanceWarningTable" class="report-table"></div>
                </div>
                
                <!-- Guest Eligibility Report -->
                <div class="report-card">
                    <h2 class="report-title">⭐ Guest Eligibility Report</h2>
                    <p class="report-description">Guests who have met membership requirements and are ready for proposal</p>
                    <div class="report-controls">
                        <button class="export-btn" onclick="generateGuestEligibilityPDF()">✨ Export PDF</button>
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
        // ============================================
        // CONFIGURATION
        // ============================================
        const SHEET_ID = '1j0uOvYCe-DvOsPjxyb7RfLm7ddeB_LL99cJKeO40RaM';
        const GUEST_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&gid=1284804990\`;
        const MEMBER_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&gid=1821690489\`;
        const BOARD_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&gid=419776584\`;
        const ATTENDANCE_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&gid=1315129184\`;
        const SCHEDULE_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&gid=1893547404\`;
        
        // ============================================
        // COMMITTEE ASSIGNMENTS (From RCUG RY2025-26)
        // ============================================
        const COMMITTEE_ASSIGNMENTS = {
            'Club Service': ['Kadeem Bowen', 'Christina Harris', 'Cliffia Rollox', 'Andrew Hing', 'Tamara Bascom', 'Omari London', 'Christine Samuels', 'Dequan Wray', 'Mariah Lawrence'],
            'Community Service': ['Darin Hall', 'Ganesh Anand', 'Cliffia Rollox', 'Jaya Persaud', 'Ngari Blair', 'Tamara Bascom', 'Orletta John', 'Parmesh Ramgobin', 'Renika Anand'],
            'Finance': ['Yushina Ramlall', 'Andrew Hing', 'Dequan Wray', 'Ngari Blair', 'Adanna Edwards', 'Asif Khan', 'Christine Samuels', 'Mariah Lawrence'],
            'International Service': ['Jemima Stephenson', 'Jaya Persaud', 'Tamara Bascom', 'Omari London', 'Asif Khan', 'Ganesh Anand', 'Renika Anand', 'Tishana Bheer', 'Tishanna Bheer'],
            'Professional Development': ['Nandita Singh', 'Christina Harris', 'Jaya Persaud', 'Ngari Blair', 'Adanna Edwards', 'Parmesh Ramgobin', 'Tishana Bheer', 'Tishanna Bheer', 'Omari London', 'Dequan Wray'],
            'Membership': ['Andrew Hing', 'Orletta John', 'Christina Harris'],
            'Public Image': ['Yushina Ramlall', 'Orletta John', 'Asif Khan', 'Cliffia Rollox']
        };
        
        // Build reverse mapping: member -> committees
        const MEMBER_COMMITTEES = {};
        Object.entries(COMMITTEE_ASSIGNMENTS).forEach(([committee, members]) => {
            members.forEach(member => {
                if (!MEMBER_COMMITTEES[member]) MEMBER_COMMITTEES[member] = [];
                if (!MEMBER_COMMITTEES[member].includes(committee)) {
                    MEMBER_COMMITTEES[member].push(committee);
                }
            });
        });
        
        // Committee name normalization mapping
        const COMMITTEE_NAME_MAP = {
            'finance': 'Finance',
            'finance ': 'Finance',
            'community service': 'Community Service',
            'community service ': 'Community Service',
            'club service': 'Club Service',
            'club service ': 'Club Service',
            'professional development': 'Professional Development',
            'international service': 'International Service',
            'membership': 'Membership',
            'public image': 'Public Image'
        };
        
        function normalizeCommitteeName(name) {
            if (!name) return null;
            const lower = name.toString().toLowerCase().trim();
            return COMMITTEE_NAME_MAP[lower] || name.trim();
        }
        
        // ============================================
        // DATA STORAGE
        // ============================================
        const NEW_MEMBERS_DEC7 = ['Brittany Ross', 'Patrick Bacchus', 'Randolph Benn'];
        const BOARD_MEMBERS = ['Adanna Edwards', 'Andrew Hing', 'Christine Samuels', 'Darin Hall', 'Ganesh Anand', 'Jemima Stephenson', 'Kadeem Bowen', 'Nandita Singh', 'Omari London', 'Ruth Manbodh', 'Vishal Roopnarine', 'Yushina Ramlall'];
        
        let members = [], guests = [], allAttendance = [], boardAttendance = {}, meetingSchedule = [];
        let currentTab = 'members', currentPeriod = 'h1';
        
        // Dynamic totals calculated from data
        let meetingTotals = { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0, annual: 0 };
        let committeeMeetingTotals = { q1: {}, q2: {}, q3: {}, q4: {}, h1: {}, h2: {}, annual: {} };
        let projectTotals = { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0, annual: 0 };
        
        // ============================================
        // DATA LOADING
        // ============================================
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
                const [guestData, memberData, boardData, attData, scheduleData] = await Promise.all([
                    fetchCSV(GUEST_URL, 'Guests').catch(e => { console.error('Guest data error:', e); return []; }),
                    fetchCSV(MEMBER_URL, 'Members').catch(e => { console.error('Member data error:', e); return []; }),
                    fetchCSV(BOARD_URL, 'Board').catch(e => { console.error('Board data error:', e); return []; }),
                    fetchCSV(ATTENDANCE_URL, 'Attendance').catch(e => { console.error('Attendance data error:', e); return []; }),
                    fetchCSV(SCHEDULE_URL, 'Schedule').catch(e => { console.error('Schedule data error:', e); return []; })
                ]);
                
                if (memberData.length === 0) throw new Error('Could not load member data');
                
                processMeetingSchedule(scheduleData);
                processAttendance(attData);
                calculateMeetingTotals();
                processBoard(boardData);
                processGuests(guestData);
                processMembers(memberData);
                linkNewMembersData();
                calculateMemberStats();
                
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
        
        // ============================================
        // MEETING SCHEDULE PROCESSING
        // ============================================
        function processMeetingSchedule(data) {
            meetingSchedule = [];
            if (!data.length) return;
            
            const hdr = data.findIndex(r => r[0] === 'ID' || r[1] === 'Date');
            for (let i = (hdr >= 0 ? hdr : 0) + 1; i < data.length; i++) {
                const r = data[i];
                if (!r[1]) continue;
                
                let dateStr = r[1];
                let d = new Date(dateStr);
                if (isNaN(d)) continue;
                
                // Fix year typo (2026-09-22 should be 2025-09-22 for Q1)
                if (d.getFullYear() === 2026 && d.getMonth() === 8) {
                    d = new Date(2025, 8, d.getDate());
                }
                
                const type = (r[2] || '').toString().trim();
                const name = (r[3] || '').toString().trim();
                const quarter = (r[4] || '').toString().trim();
                
                meetingSchedule.push({
                    id: r[0],
                    date: d,
                    dateKey: d.toISOString().split('T')[0],
                    type: type,
                    name: name,
                    committeeName: type === 'Committee Meeting' ? normalizeCommitteeName(name) : null,
                    quarter: quarter,
                    month: d.getMonth() + 1
                });
            }
            console.log('Meeting schedule loaded:', meetingSchedule.length, 'meetings');
        }
        
        // ============================================
        // ATTENDANCE PROCESSING
        // ============================================
        function processAttendance(data) {
            allAttendance = [];
            if (!data.length) return;
            const hdr = data.findIndex(r => r[0] === 'Full Name');
            for (let i = (hdr >= 0 ? hdr : 2) + 1; i < data.length; i++) {
                const r = data[i];
                if (!r[0]) continue;
                let dateStr = r[6], meetingType = r[7], projectName = r[8], quarter = r[9];
                let month = null, dateKey = null, d = null;
                if (dateStr) {
                    d = new Date(dateStr);
                    if (!isNaN(d)) {
                        // Fix year typo
                        if (d.getFullYear() === 2026 && d.getMonth() === 8) {
                            d = new Date(2025, 8, d.getDate());
                        }
                        month = d.getMonth() + 1;
                        dateKey = d.toISOString().split('T')[0];
                    }
                }
                
                const type = (meetingType || '').toString().trim();
                const committeeName = type === 'Committee Meeting' ? normalizeCommitteeName(projectName) : null;
                
                allAttendance.push({ 
                    name: r[0].trim(), 
                    type: type, 
                    projectName: (projectName || '').toString().trim(),
                    committeeName: committeeName,
                    month, 
                    quarter: (quarter || '').toString().trim(), 
                    dateKey,
                    date: d
                });
            }
            console.log('Attendance loaded:', allAttendance.length, 'records');
        }
        
        // ============================================
        // CALCULATE MEETING TOTALS
        // ============================================
        function calculateMeetingTotals() {
            const periods = ['q1', 'q2', 'q3', 'q4', 'h1', 'h2', 'annual'];
            
            // Reset totals
            periods.forEach(p => {
                meetingTotals[p] = 0;
                committeeMeetingTotals[p] = {};
                projectTotals[p] = 0;
            });
            
            // Use meeting schedule as source of truth
            meetingSchedule.forEach(meeting => {
                const q = meeting.quarter.toLowerCase();
                const isQ1 = q === 'q1';
                const isQ2 = q === 'q2';
                const isQ3 = q === 'q3';
                const isQ4 = q === 'q4';
                
                if (meeting.type === 'Business Meeting' || meeting.type === 'Fellowship Meeting') {
                    // Regular meetings - count for all periods they belong to
                    if (isQ1) { meetingTotals.q1++; meetingTotals.h1++; meetingTotals.annual++; }
                    if (isQ2) { meetingTotals.q2++; meetingTotals.h1++; meetingTotals.annual++; }
                    if (isQ3) { meetingTotals.q3++; meetingTotals.h2++; meetingTotals.annual++; }
                    if (isQ4) { meetingTotals.q4++; meetingTotals.h2++; meetingTotals.annual++; }
                } else if (meeting.type === 'Committee Meeting' && meeting.committeeName) {
                    // Committee meetings - track by committee name
                    const comm = meeting.committeeName;
                    periods.forEach(p => {
                        if (!committeeMeetingTotals[p][comm]) committeeMeetingTotals[p][comm] = 0;
                    });
                    
                    if (isQ1) { 
                        committeeMeetingTotals.q1[comm]++; 
                        committeeMeetingTotals.h1[comm] = (committeeMeetingTotals.h1[comm] || 0) + 1;
                        committeeMeetingTotals.annual[comm] = (committeeMeetingTotals.annual[comm] || 0) + 1;
                    }
                    if (isQ2) { 
                        committeeMeetingTotals.q2[comm]++; 
                        committeeMeetingTotals.h1[comm] = (committeeMeetingTotals.h1[comm] || 0) + 1;
                        committeeMeetingTotals.annual[comm] = (committeeMeetingTotals.annual[comm] || 0) + 1;
                    }
                    if (isQ3) { 
                        committeeMeetingTotals.q3[comm]++; 
                        committeeMeetingTotals.h2[comm] = (committeeMeetingTotals.h2[comm] || 0) + 1;
                        committeeMeetingTotals.annual[comm] = (committeeMeetingTotals.annual[comm] || 0) + 1;
                    }
                    if (isQ4) { 
                        committeeMeetingTotals.q4[comm]++; 
                        committeeMeetingTotals.h2[comm] = (committeeMeetingTotals.h2[comm] || 0) + 1;
                        committeeMeetingTotals.annual[comm] = (committeeMeetingTotals.annual[comm] || 0) + 1;
                    }
                } else if (meeting.type === 'Project') {
                    if (isQ1) { projectTotals.q1++; projectTotals.h1++; projectTotals.annual++; }
                    if (isQ2) { projectTotals.q2++; projectTotals.h1++; projectTotals.annual++; }
                    if (isQ3) { projectTotals.q3++; projectTotals.h2++; projectTotals.annual++; }
                    if (isQ4) { projectTotals.q4++; projectTotals.h2++; projectTotals.annual++; }
                }
            });
            
            console.log('Meeting totals:', meetingTotals);
            console.log('Committee meeting totals:', committeeMeetingTotals);
            console.log('Project totals:', projectTotals);
        }
        
        // ============================================
        // GET MEMBER'S TOTAL ELIGIBLE MEETINGS
        // ============================================
        function getMemberEligibleMeetings(memberName, period) {
            // Regular meetings apply to everyone
            let total = meetingTotals[period] || 0;
            
            // Committee meetings only apply to assigned members
            const memberComms = MEMBER_COMMITTEES[memberName] || [];
            const commTotals = committeeMeetingTotals[period] || {};
            
            memberComms.forEach(comm => {
                total += commTotals[comm] || 0;
            });
            
            return total;
        }
        
        // ============================================
        // BOARD ATTENDANCE
        // ============================================
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
        
        // ============================================
        // GUEST PROCESSING
        // ============================================
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
                const meetTotal = meetingTotals.h1 || 1;
                const projTotal = projectTotals.h1 || 1;
                g.meetPct = meetTotal > 0 ? (g.meetings / meetTotal) * 100 : 0;
                g.projPct = projTotal > 0 ? (g.projects / projTotal) * 100 : 0;
                guests.push(g);
            });
        }
        
        // ============================================
        // MEMBER PROCESSING
        // ============================================
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
                const isOnLeave = registryStatus.toLowerCase().includes('leave');
                const memberCommittees = MEMBER_COMMITTEES[name] || [];
                
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
                    registryStatus: registryStatus,
                    education: (r[11] || '').toString().trim(),
                    profession: (r[12] || '').toString().trim(),
                    armsOfService: (r[13] || '').toString().trim(),
                    positionsHeld: (r[14] || '').toString().trim(),
                    incomingPosition: (r[15] || '').toString().trim(),
                    talentsHobbies: (r[16] || '').toString().trim(),
                    isNewDec7, 
                    isBoardMember, 
                    isTerminated,
                    isOnLeave,
                    committees: memberCommittees,
                    // Attendance tracking
                    regularMeetings: { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0, annual: 0 },
                    committeeMeetings: { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0, annual: 0 },
                    totalMeetings: { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0, annual: 0 },
                    projects: { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0, annual: 0 },
                    eligibleMeetings: { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0, annual: 0 },
                    attendanceDetails: [],
                    boardMeetings: isBoardMember && boardAttendance[name] ? boardAttendance[name] : null
                });
            }
        }
        
        function linkNewMembersData() {
            NEW_MEMBERS_DEC7.forEach(name => {
                const member = members.find(m => m.fullName === name);
                const guest = guests.find(g => g.fullName === name);
                if (member && guest) {
                    member.regularMeetings.q1 = guest.meetings;
                    member.projects.q1 = guest.projects;
                    member.regularMeetings.h1 = guest.meetings;
                    member.projects.h1 = guest.projects;
                }
            });
        }
        
        // ============================================
        // CALCULATE MEMBER STATS
        // ============================================
        function calculateMemberStats() {
            const periods = ['q1', 'q2', 'q3', 'q4', 'h1', 'h2', 'annual'];
            
            members.forEach(m => {
                // Reset
                periods.forEach(p => {
                    m.regularMeetings[p] = 0;
                    m.committeeMeetings[p] = 0;
                    m.totalMeetings[p] = 0;
                    m.projects[p] = 0;
                    m.eligibleMeetings[p] = getMemberEligibleMeetings(m.fullName, p);
                });
                m.attendanceDetails = [];
                
                // Process all attendance records for this member
                const memberAtt = allAttendance.filter(a => a.name === m.fullName);
                
                memberAtt.forEach(att => {
                    const q = att.quarter.toLowerCase();
                    const isQ1 = q === 'q1';
                    const isQ2 = q === 'q2';
                    const isQ3 = q === 'q3';
                    const isQ4 = q === 'q4';
                    
                    // Build attendance detail record
                    const detail = {
                        date: att.date,
                        dateKey: att.dateKey,
                        type: att.type,
                        name: att.projectName || att.type,
                        committeeName: att.committeeName,
                        quarter: att.quarter,
                        attended: true
                    };
                    m.attendanceDetails.push(detail);
                    
                    if (att.type === 'Business Meeting' || att.type === 'Fellowship Meeting') {
                        // Regular meetings
                        if (isQ1) { m.regularMeetings.q1++; m.regularMeetings.h1++; m.regularMeetings.annual++; }
                        if (isQ2) { m.regularMeetings.q2++; m.regularMeetings.h1++; m.regularMeetings.annual++; }
                        if (isQ3) { m.regularMeetings.q3++; m.regularMeetings.h2++; m.regularMeetings.annual++; }
                        if (isQ4) { m.regularMeetings.q4++; m.regularMeetings.h2++; m.regularMeetings.annual++; }
                    } else if (att.type === 'Committee Meeting') {
                        // Committee meetings - only count if member is assigned to that committee
                        const isAssigned = m.committees.includes(att.committeeName);
                        if (isAssigned) {
                            if (isQ1) { m.committeeMeetings.q1++; m.committeeMeetings.h1++; m.committeeMeetings.annual++; }
                            if (isQ2) { m.committeeMeetings.q2++; m.committeeMeetings.h1++; m.committeeMeetings.annual++; }
                            if (isQ3) { m.committeeMeetings.q3++; m.committeeMeetings.h2++; m.committeeMeetings.annual++; }
                            if (isQ4) { m.committeeMeetings.q4++; m.committeeMeetings.h2++; m.committeeMeetings.annual++; }
                        }
                    } else if (att.type === 'Project') {
                        if (isQ1) { m.projects.q1++; m.projects.h1++; m.projects.annual++; }
                        if (isQ2) { m.projects.q2++; m.projects.h1++; m.projects.annual++; }
                        if (isQ3) { m.projects.q3++; m.projects.h2++; m.projects.annual++; }
                        if (isQ4) { m.projects.q4++; m.projects.h2++; m.projects.annual++; }
                    }
                });
                
                // Calculate total meetings attended
                periods.forEach(p => {
                    m.totalMeetings[p] = m.regularMeetings[p] + m.committeeMeetings[p];
                });
                
                // Sort attendance details by date
                m.attendanceDetails.sort((a, b) => (a.date || 0) - (b.date || 0));
            });
        }
        
        // ============================================
        // UTILITY FUNCTIONS
        // ============================================
        function formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            const d = new Date(dateStr);
            if (isNaN(d)) return 'N/A';
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return \`\${d.getDate()} \${months[d.getMonth()]} \${d.getFullYear()}\`;
        }
        
        function formatDateShort(date) {
            if (!date) return 'N/A';
            const d = new Date(date);
            if (isNaN(d)) return 'N/A';
            return d.toISOString().split('T')[0];
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
        
        // ============================================
        // UI FUNCTIONS
        // ============================================
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
        
        function isGoodStanding(m) {
            if (m.isTerminated) return false;
            const eligible = m.eligibleMeetings[currentPeriod] || 1;
            const attended = m.totalMeetings[currentPeriod] || 0;
            const pct = eligible > 0 ? (attended / eligible) * 100 : 0;
            return pct >= 60;
        }
        
        function getAttendancePercentage(m, period) {
            const eligible = m.eligibleMeetings[period] || 1;
            const attended = m.totalMeetings[period] || 0;
            return eligible > 0 ? (attended / eligible) * 100 : 0;
        }
        
        function renderMembers() {
            const statusFilter = document.getElementById('statusFilter').value;
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            let filtered = members.filter(m => {
                if (statusFilter === 'good' && (!isGoodStanding(m) || m.isOnLeave)) return false;
                if (statusFilter === 'notgood' && (isGoodStanding(m) || m.isOnLeave || m.isTerminated)) return false;
                if (statusFilter === 'onleave' && !m.isOnLeave) return false;
                if (statusFilter === 'terminated' && !m.isTerminated) return false;
                if (searchTerm && !m.fullName.toLowerCase().includes(searchTerm)) return false;
                return true;
            });
            
            // Calculate stats
            const activeMembers = members.filter(m => !m.isTerminated);
            const goodCount = activeMembers.filter(m => !m.isOnLeave && isGoodStanding(m)).length;
            const needsWorkCount = activeMembers.filter(m => !m.isOnLeave && !isGoodStanding(m)).length;
            
            // Calculate average attendance
            let totalPct = 0;
            let countForAvg = 0;
            activeMembers.filter(m => !m.isOnLeave).forEach(m => {
                totalPct += getAttendancePercentage(m, currentPeriod);
                countForAvg++;
            });
            const avgPct = countForAvg > 0 ? Math.round(totalPct / countForAvg) : 0;
            
            document.getElementById('totalMembers').textContent = activeMembers.length;
            document.getElementById('goodStanding').textContent = goodCount;
            document.getElementById('needsWork').textContent = needsWorkCount;
            document.getElementById('avgAttendance').textContent = avgPct + '%';
            
            const grid = document.getElementById('memberGrid');
            grid.innerHTML = filtered.map(m => renderMemberCard(m)).join('');
        }
        
        function renderMemberCard(m) {
            const period = currentPeriod;
            const eligible = m.eligibleMeetings[period] || 0;
            const attended = m.totalMeetings[period] || 0;
            const regularAtt = m.regularMeetings[period] || 0;
            const committeeAtt = m.committeeMeetings[period] || 0;
            const regularTotal = meetingTotals[period] || 0;
            
            // Calculate committee meetings total for this member's committees
            let memberCommitteeTotal = 0;
            const commTotals = committeeMeetingTotals[period] || {};
            (m.committees || []).forEach(comm => {
                memberCommitteeTotal += commTotals[comm] || 0;
            });
            
            const pct = eligible > 0 ? (attended / eligible) * 100 : 0;
            const projTotal = projectTotals[period] || 0;
            const projPct = projTotal > 0 ? (m.projects[period] / projTotal) * 100 : 0;
            
            let statusClass = 'good', statusText = 'Good Standing';
            if (m.isTerminated) { statusClass = 'terminated'; statusText = 'Terminated'; }
            else if (m.isOnLeave) { statusClass = 'onleave'; statusText = 'On Leave'; }
            else if (pct < 60) { statusClass = 'notgood'; statusText = 'Not Good Standing'; }
            
            const badges = [];
            if (m.isNewDec7) badges.push('<span class="badge badge-new">NEW</span>');
            if (m.isBoardMember) badges.push('<span class="badge badge-board">BOARD</span>');
            if (m.isTerminated) badges.push('<span class="badge badge-terminated">TERMINATED</span>');
            if (m.isOnLeave) badges.push('<span class="badge badge-onleave">ON LEAVE</span>');
            
            // Committee tags
            let committeeTags = '';
            if (m.committees && m.committees.length > 0) {
                committeeTags = '<div class="committee-tags">' + 
                    m.committees.map(c => \`<span class="committee-tag">\${c}</span>\`).join('') + 
                    '</div>';
            }
            
            // Board meeting section
            let boardSection = '';
            if (m.isBoardMember && m.boardMeetings) {
                let bp, btotal;
                if (period === 'h1') { bp = (m.boardMeetings.q1 || 0) + (m.boardMeetings.q2 || 0); btotal = 6; }
                else if (period === 'h2') { bp = (m.boardMeetings.q3 || 0) + (m.boardMeetings.q4 || 0); btotal = 6; }
                else if (period === 'annual') { bp = (m.boardMeetings.total || 0); btotal = 12; }
                else { bp = (m.boardMeetings[period] || 0); btotal = 3; }
                boardSection = \`
                    <div class="progress-row">
                        <span class="progress-label">Board Mtgs</span>
                        <div class="progress-bar">
                            <div class="progress-fill board" style="width: \${Math.min((bp/btotal)*100, 100)}%"></div>
                        </div>
                        <span class="progress-value">\${bp}/\${btotal} (\${Math.round((bp/btotal)*100)}%)</span>
                    </div>
                \`;
            }
            
            return \`
                <div class="member-card \${statusClass}" onclick="showMemberDetails('\${m.fullName.replace(/'/g, "\\\\'")}')">
                    <div class="card-actions">
                        <button class="card-action-btn" onclick="event.stopPropagation(); exportMemberCard('\${m.fullName.replace(/'/g, "\\\\'")}')">✨ Export</button>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="member-name">\${m.fullName} \${badges.join('')}</div>
                            <div class="member-tag">\${m.category}</div>
                            \${committeeTags}
                        </div>
                        <span class="status-badge status-\${statusClass}">\${statusText}</span>
                    </div>
                    
                    <!-- Good Standing Calculation -->
                    <div class="good-standing-box \${pct < 60 ? 'not-good' : ''}">
                        <div class="good-standing-title">GOOD STANDING CALCULATION (Regular + Committee Meetings)</div>
                        <div class="good-standing-value \${pct >= 60 ? 'good' : 'not-good'}">\${attended}/\${eligible} (\${Math.round(pct)}%)</div>
                        <div class="good-standing-breakdown">Regular: \${regularAtt}/\${regularTotal} | Committee: \${committeeAtt}/\${memberCommitteeTotal}</div>
                    </div>
                    
                    <!-- Progress Bars -->
                    <div class="progress-section" style="margin-top: 15px;">
                        <div class="progress-row">
                            <span class="progress-label">Regular Mtgs</span>
                            <div class="progress-bar">
                                <div class="progress-fill meetings" style="width: \${Math.min((regularAtt/(regularTotal||1))*100, 100)}%"></div>
                            </div>
                            <span class="progress-value">\${regularAtt}/\${regularTotal}</span>
                        </div>
                        <div class="progress-row">
                            <span class="progress-label">Committee Mtgs</span>
                            <div class="progress-bar">
                                <div class="progress-fill committee" style="width: \${Math.min((committeeAtt/(memberCommitteeTotal||1))*100, 100)}%"></div>
                            </div>
                            <span class="progress-value">\${committeeAtt}/\${memberCommitteeTotal}</span>
                        </div>
                        <div class="progress-row">
                            <span class="progress-label">Projects</span>
                            <div class="progress-bar">
                                <div class="progress-fill projects" style="width: \${Math.min(projPct, 100)}%"></div>
                            </div>
                            <span class="progress-value">\${m.projects[period]}/\${projTotal} (\${Math.round(projPct)}%)</span>
                        </div>
                        \${boardSection}
                    </div>
                </div>
            \`;
        }
        
        // ============================================
        // MEMBER DETAILS MODAL
        // ============================================
        function showMemberDetails(name) {
            const m = members.find(mem => mem.fullName === name);
            if (!m) return;
            
            const modal = document.getElementById('memberModal');
            const content = document.getElementById('modalContent');
            const period = currentPeriod;
            
            const eligible = m.eligibleMeetings[period] || 0;
            const attended = m.totalMeetings[period] || 0;
            const pct = eligible > 0 ? (attended / eligible) * 100 : 0;
            
            // Build attendance history from meeting schedule
            const attendanceHistory = buildAttendanceHistory(m, period);
            
            // Board meeting details
            let boardSection = '';
            if (m.isBoardMember && m.boardMeetings) {
                boardSection = \`
                    <div class="detail-section">
                        <h3 class="detail-title">📋 Board Meeting Attendance</h3>
                        <div class="detail-grid">
                            <div class="detail-card">
                                <div class="detail-label">Q1</div>
                                <div class="detail-value">\${m.boardMeetings.q1 || 0}/3</div>
                            </div>
                            <div class="detail-card">
                                <div class="detail-label">Q2</div>
                                <div class="detail-value">\${m.boardMeetings.q2 || 0}/3</div>
                            </div>
                            <div class="detail-card">
                                <div class="detail-label">Q3</div>
                                <div class="detail-value">\${m.boardMeetings.q3 || 0}/3</div>
                            </div>
                            <div class="detail-card">
                                <div class="detail-label">Q4</div>
                                <div class="detail-value">\${m.boardMeetings.q4 || 0}/3</div>
                            </div>
                            <div class="detail-card full-width">
                                <div class="detail-label">Total</div>
                                <div class="detail-value">\${m.boardMeetings.total || 0}/12</div>
                            </div>
                        </div>
                    </div>
                \`;
            }
            
            // Committee assignments
            let committeeSection = '';
            if (m.committees && m.committees.length > 0) {
                committeeSection = \`
                    <div class="detail-section">
                        <h3 class="detail-title">🏛️ Committee Assignments</h3>
                        <div class="committee-tags" style="margin-top: 10px;">
                            \${m.committees.map(c => \`<span class="committee-tag" style="font-size: 0.85rem; padding: 5px 12px;">\${c}</span>\`).join('')}
                        </div>
                    </div>
                \`;
            }
            
            content.innerHTML = \`
                <div class="modal-header">
                    <h2 class="modal-name">\${m.fullName}</h2>
                    <div class="modal-email">\${m.email || 'No email'}</div>
                    \${m.contact ? \`<div class="modal-contact">📞 \${m.contact}</div>\` : ''}
                </div>
                
                <!-- Attendance Summary -->
                <div class="detail-section">
                    <h3 class="detail-title">📊 Attendance Summary (\${period.toUpperCase()})</h3>
                    <div class="detail-grid">
                        <div class="detail-card">
                            <div class="detail-label">Good Standing Status</div>
                            <div class="detail-value" style="color: \${pct >= 60 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                                \${pct >= 60 ? '✅ Good Standing' : '❌ Not Good Standing'}
                            </div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">Overall Attendance</div>
                            <div class="detail-value">\${attended}/\${eligible} (\${Math.round(pct)}%)</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">Regular Meetings</div>
                            <div class="detail-value">\${m.regularMeetings[period]}/\${meetingTotals[period] || 0}</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">Committee Meetings</div>
                            <div class="detail-value">\${m.committeeMeetings[period]}/\${eligible - (meetingTotals[period] || 0)}</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">Projects</div>
                            <div class="detail-value">\${m.projects[period]}/\${projectTotals[period] || 0}</div>
                        </div>
                    </div>
                </div>
                
                \${boardSection}
                \${committeeSection}
                
                <!-- Attendance Details -->
                <div class="detail-section">
                    <h3 class="detail-title">📅 Attendance Details (\${period.toUpperCase()})</h3>
                    <div class="detail-grid">
                        <div class="detail-card">
                            <div class="detail-label">Meetings Attended</div>
                            <div class="meeting-list">
                                \${attendanceHistory.attended.length > 0 ? 
                                    attendanceHistory.attended.map(a => \`
                                        <div class="meeting-item attended">
                                            <div>
                                                <div class="meeting-date">\${a.dateKey}</div>
                                                <div class="meeting-type">\${a.type}</div>
                                                \${a.name ? \`<div class="meeting-name">\${a.name}</div>\` : ''}
                                            </div>
                                            <span class="meeting-status attended">Attended</span>
                                        </div>
                                    \`).join('') :
                                    '<div style="color: #95a5a6; padding: 10px;">No meetings attended</div>'
                                }
                            </div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">Meetings Missed</div>
                            <div class="meeting-list">
                                \${attendanceHistory.missed.length > 0 ? 
                                    attendanceHistory.missed.map(a => \`
                                        <div class="meeting-item missed">
                                            <div>
                                                <div class="meeting-date">\${a.dateKey}</div>
                                                <div class="meeting-type">\${a.type}</div>
                                                \${a.name ? \`<div class="meeting-name">\${a.name}</div>\` : ''}
                                            </div>
                                            <span class="meeting-status missed">Missed</span>
                                        </div>
                                    \`).join('') :
                                    '<div style="color: #27ae60; padding: 10px;">No meetings missed! 🎉</div>'
                                }
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Member Info -->
                <div class="detail-section">
                    <h3 class="detail-title">👤 Member Information</h3>
                    <div class="detail-grid">
                        <div class="detail-card">
                            <div class="detail-label">Date of Birth</div>
                            <div class="detail-value">\${formatDate(m.dateOfBirth)}\${m.age ? \` (Age: \${m.age})\` : ''}</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">Date Inducted</div>
                            <div class="detail-value">\${formatDate(m.dateInducted)}\${getYearsOfService(m.dateInducted) !== null ? \` (\${getYearsOfService(m.dateInducted)} years)\` : ''}</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">UG Status</div>
                            <div class="detail-value">\${m.ugStatus || 'N/A'}</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-label">Registry Status</div>
                            <div class="detail-value">\${m.registryStatus || 'Active'}</div>
                        </div>
                        \${m.profession ? \`
                        <div class="detail-card full-width">
                            <div class="detail-label">Profession</div>
                            <div class="detail-value">\${m.profession}</div>
                        </div>
                        \` : ''}
                        \${m.incomingPosition ? \`
                        <div class="detail-card full-width">
                            <div class="detail-label">Position (2025-2026)</div>
                            <div class="detail-value">\${m.incomingPosition}</div>
                        </div>
                        \` : ''}
                    </div>
                </div>
            \`;
            
            modal.style.display = 'flex';
        }
        
        function buildAttendanceHistory(member, period) {
            const attended = [];
            const missed = [];
            
            // Get all meetings from schedule that apply to this member for this period
            const relevantMeetings = meetingSchedule.filter(meeting => {
                const q = meeting.quarter.toLowerCase();
                const inPeriod = 
                    (period === 'q1' && q === 'q1') ||
                    (period === 'q2' && q === 'q2') ||
                    (period === 'q3' && q === 'q3') ||
                    (period === 'q4' && q === 'q4') ||
                    (period === 'h1' && (q === 'q1' || q === 'q2')) ||
                    (period === 'h2' && (q === 'q3' || q === 'q4')) ||
                    (period === 'annual');
                
                if (!inPeriod) return false;
                
                // Regular meetings apply to everyone
                if (meeting.type === 'Business Meeting' || meeting.type === 'Fellowship Meeting') {
                    return true;
                }
                
                // Committee meetings only apply to assigned members
                if (meeting.type === 'Committee Meeting') {
                    return member.committees.includes(meeting.committeeName);
                }
                
                return false;
            });
            
            // Check which meetings were attended
            relevantMeetings.forEach(meeting => {
                const wasAttended = member.attendanceDetails.some(att => 
                    att.dateKey === meeting.dateKey && 
                    (att.type === meeting.type || 
                     (att.type === 'Committee Meeting' && meeting.type === 'Committee Meeting'))
                );
                
                const record = {
                    dateKey: meeting.dateKey,
                    type: meeting.type,
                    name: meeting.name || meeting.committeeName || ''
                };
                
                if (wasAttended) {
                    attended.push(record);
                } else {
                    missed.push(record);
                }
            });
            
            // Sort by date
            attended.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
            missed.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
            
            return { attended, missed };
        }
        
        function closeModal(event) {
            if (!event || event.target === document.getElementById('memberModal')) {
                document.getElementById('memberModal').style.display = 'none';
            }
        }
        
        // ============================================
        // GUEST FUNCTIONS
        // ============================================
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
            return g.meetPct >= 60 && g.projPct >= 50 && g.info && g.committee && g.ug;
        }
        
        function renderGuestCard(g) {
            const eligible = isEligible(g);
            const statusClass = eligible ? 'eligible' : g.ug ? 'guest' : 'notug';
            const statusText = eligible ? '✅ Eligible' : !g.info ? '❓ Info Session Needed' : !g.ug ? '❌ Not UG' : '⏳ In Progress';
            
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
                            <div class="progress-fill meetings" style="width: \${Math.min(g.meetPct, 100)}%"></div>
                        </div>
                        <span class="progress-value">\${g.meetings}/\${meetingTotals.h1} (\${Math.round(g.meetPct)}%)</span>
                    </div>
                    <div class="progress-row">
                        <span class="progress-label">Projects</span>
                        <div class="progress-bar">
                            <div class="progress-fill projects" style="width: \${Math.min(g.projPct, 100)}%"></div>
                        </div>
                        <span class="progress-value">\${g.projects}/\${projectTotals.h1 || 0} (\${Math.round(g.projPct)}%)</span>
                    </div>
                    <div class="checklist">
                        <div class="check-item \${g.meetPct >= 60 ? 'check-done' : 'check-pending'}">\${g.meetPct >= 60 ? '✅' : '❌'} 60% Meetings (\${Math.round(g.meetPct)}%)</div>
                        <div class="check-item \${g.projPct >= 50 ? 'check-done' : 'check-pending'}">\${g.projPct >= 50 ? '✅' : '❌'} 50% Projects (\${Math.round(g.projPct)}%)</div>
                        <div class="check-item \${g.info ? 'check-done' : 'check-pending'}">\${g.info ? '✅' : '❌'} Info Session</div>
                        <div class="check-item \${g.committee ? 'check-done' : 'check-pending'}">\${g.committee ? '✅' : '❌'} Committee Meeting</div>
                        <div class="check-item \${g.ug ? 'check-done' : 'check-pending'}">\${g.ug ? '✅' : '❌'} UG Student/Graduate</div>
                    </div>
                </div>
            \`;
        }
        
        // ============================================
        // REPORTS
        // ============================================
        function updateReports() {
            updateBirthdayReport();
            updateAnniversaryReport();
            updateAttendanceWarningReport();
            updateGuestEligibilityReport();
        }
        
        function updateBirthdayReport() {
            const month = document.getElementById('birthdayMonthFilter').value;
            const container = document.getElementById('birthdayReportTable');
            const btn = document.getElementById('birthdayExportBtn');
            
            if (!month) {
                container.innerHTML = '<p style="padding: 20px; color: #95a5a6;">Select a month to view birthdays</p>';
                btn.disabled = true;
                return;
            }
            
            const birthdays = members.filter(m => !m.isTerminated && getMonthFromDate(m.dateOfBirth) === parseInt(month));
            btn.disabled = birthdays.length === 0;
            
            if (birthdays.length === 0) {
                container.innerHTML = '<p style="padding: 20px; color: #95a5a6;">No birthdays this month</p>';
                return;
            }
            
            container.innerHTML = \`
                <table>
                    <thead><tr><th>Name</th><th>Birthday</th><th>Age</th></tr></thead>
                    <tbody>
                        \${birthdays.map(m => \`<tr><td>\${m.fullName}</td><td>\${formatDate(m.dateOfBirth)}</td><td>\${m.age || 'N/A'}</td></tr>\`).join('')}
                    </tbody>
                </table>
            \`;
        }
        
        function updateAnniversaryReport() {
            const month = document.getElementById('anniversaryMonthFilter').value;
            const container = document.getElementById('anniversaryReportTable');
            const btn = document.getElementById('anniversaryExportBtn');
            
            if (!month) {
                container.innerHTML = '<p style="padding: 20px; color: #95a5a6;">Select a month to view anniversaries</p>';
                btn.disabled = true;
                return;
            }
            
            const anniversaries = members.filter(m => !m.isTerminated && getMonthFromDate(m.dateInducted) === parseInt(month));
            btn.disabled = anniversaries.length === 0;
            
            if (anniversaries.length === 0) {
                container.innerHTML = '<p style="padding: 20px; color: #95a5a6;">No induction anniversaries this month</p>';
                return;
            }
            
            container.innerHTML = \`
                <table>
                    <thead><tr><th>Name</th><th>Date Inducted</th><th>Years of Service</th></tr></thead>
                    <tbody>
                        \${anniversaries.map(m => \`<tr><td>\${m.fullName}</td><td>\${formatDate(m.dateInducted)}</td><td>\${getYearsOfService(m.dateInducted) || 'N/A'}</td></tr>\`).join('')}
                    </tbody>
                </table>
            \`;
        }
        
        function updateAttendanceWarningReport() {
            const period = document.getElementById('quarterFilter').value;
            const container = document.getElementById('attendanceWarningTable');
            
            const atRisk = members.filter(m => {
                if (m.isTerminated || m.isOnLeave) return false;
                const eligible = m.eligibleMeetings[period] || 1;
                const attended = m.totalMeetings[period] || 0;
                const pct = (attended / eligible) * 100;
                return pct < 60;
            }).sort((a, b) => {
                const pctA = (a.totalMeetings[period] / (a.eligibleMeetings[period] || 1)) * 100;
                const pctB = (b.totalMeetings[period] / (b.eligibleMeetings[period] || 1)) * 100;
                return pctA - pctB;
            });
            
            if (atRisk.length === 0) {
                container.innerHTML = '<p style="padding: 20px; color: #27ae60;">🎉 All members are in good standing!</p>';
                return;
            }
            
            container.innerHTML = \`
                <table>
                    <thead><tr><th>Name</th><th>Regular Mtgs</th><th>Committee Mtgs</th><th>Total</th><th>Eligible</th><th>Attendance %</th></tr></thead>
                    <tbody>
                        \${atRisk.map(m => {
                            const eligible = m.eligibleMeetings[period] || 1;
                            const attended = m.totalMeetings[period] || 0;
                            const pct = Math.round((attended / eligible) * 100);
                            return \`<tr>
                                <td>\${m.fullName}</td>
                                <td>\${m.regularMeetings[period]}/\${meetingTotals[period]}</td>
                                <td>\${m.committeeMeetings[period]}/\${eligible - meetingTotals[period]}</td>
                                <td>\${attended}</td>
                                <td>\${eligible}</td>
                                <td style="color: \${pct < 50 ? '#e74c3c' : '#e67e22'}">\${pct}%</td>
                            </tr>\`;
                        }).join('')}
                    </tbody>
                </table>
            \`;
        }
        
        function updateGuestEligibilityReport() {
            const container = document.getElementById('guestEligibilityTable');
            const eligible = guests.filter(isEligible);
            
            if (eligible.length === 0) {
                container.innerHTML = '<p style="padding: 20px; color: #95a5a6;">No guests currently eligible for membership</p>';
                return;
            }
            
            container.innerHTML = \`
                <table>
                    <thead><tr><th>Name</th><th>Meetings</th><th>Projects</th><th>Info Session</th><th>Committee</th><th>UG Status</th></tr></thead>
                    <tbody>
                        \${eligible.map(g => \`<tr>
                            <td>\${g.fullName}</td>
                            <td>\${g.meetings} (\${Math.round(g.meetPct)}%)</td>
                            <td>\${g.projects} (\${Math.round(g.projPct)}%)</td>
                            <td>\${g.info ? '✅' : '❌'}</td>
                            <td>\${g.committee ? '✅' : '❌'}</td>
                            <td>\${g.ug ? '✅' : '❌'}</td>
                        </tr>\`).join('')}
                    </tbody>
                </table>
            \`;
        }
        
        // ============================================
        // EXPORT FUNCTIONS (Simplified for brevity)
        // ============================================
        async function exportMemberCard(name) {
            alert('Export feature - Member: ' + name);
        }
        
        async function generateBirthdayPDF() {
            alert('Birthday PDF export');
        }
        
        async function generateAnniversaryPDF() {
            alert('Anniversary PDF export');
        }
        
        async function generateAttendanceWarningPDF() {
            alert('Attendance Warning PDF export');
        }
        
        async function generateAttendanceWarningCSV() {
            const period = document.getElementById('quarterFilter').value;
            const atRisk = members.filter(m => {
                if (m.isTerminated || m.isOnLeave) return false;
                const eligible = m.eligibleMeetings[period] || 1;
                const attended = m.totalMeetings[period] || 0;
                return (attended / eligible) * 100 < 60;
            });
            
            let csv = 'Name,Regular Meetings,Committee Meetings,Total Attended,Total Eligible,Attendance %,Email\\n';
            atRisk.forEach(m => {
                const eligible = m.eligibleMeetings[period] || 1;
                const attended = m.totalMeetings[period] || 0;
                const pct = Math.round((attended / eligible) * 100);
                csv += \`"\${m.fullName}",\${m.regularMeetings[period]},\${m.committeeMeetings[period]},\${attended},\${eligible},\${pct}%,"\${m.email || 'N/A'}"\\n\`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`RCUG_Attendance_Warning_\${period.toUpperCase()}_\${new Date().getFullYear()}.csv\`;
            a.click();
        }
        
        async function generateGuestEligibilityPDF() {
            alert('Guest Eligibility PDF export');
        }
        
        async function generateGuestEligibilityCSV() {
            const eligible = guests.filter(isEligible);
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
