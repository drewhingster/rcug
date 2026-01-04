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
            font-size: 0.8rem;
            max-height: 200px;
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

        <div class="debug-panel" id="debugPanel">
            <h4>🔧 Debug Console</h4>
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

        <div class="stats-bar">
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
            <div class="celebration-list" id="birthdayList"><div class="loading">Loading...</div></div>
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
            <div class="celebration-list" id="anniversaryList"><div class="loading">Loading...</div></div>
        </div>

        <div class="tab-content" id="summary-tab">
            <div class="section-title">
                <span>📊 Attendance Summary Table</span>
                <button class="export-btn" onclick="exportSummary()">📤 Export CSV</button>
            </div>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Committee</th>
                        <th>Business</th>
                        <th>Fellowship</th>
                        <th>Projects</th>
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
        var SPREADSHEET_ID = '1j0uOvYCe-DvOsPjxyb7RfLm7ddeB_LL99cJKeO40RaM';
        var MEMBER_REGISTRY_GID = '1821690489';
        var ALL_ATTENDANCE_GID = '1315129184';
        var GUEST_TRACKING_GID = '1284804990';
        var MEETING_SCHEDULE_GID = '1708148096';

        // Committee assignments
        var COMMITTEE_ASSIGNMENTS = {
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

        var BOARD_MEMBERS = ['Jemima Stephenson', 'Darin Hall', 'Ganesh Anand', 'Adanna Edwards',
            'Yushina Ramlall', 'Nandita Singh', 'Kadeem Bowen', 'Vishal Roopnarine', 'Andrew Hing'];

        // Global data
        var memberData = [];
        var attendanceData = [];
        var guestData = [];
        var currentPeriod = 'Q2';
        var currentBirthdayMonth = 'all';
        var currentAnniversaryMonth = 'all';

        // Debug logging
        function debugLog(msg, type) {
            var div = document.getElementById('debugLog');
            var time = new Date().toLocaleTimeString();
            div.innerHTML += '<div class="' + (type || 'info') + '">[' + time + '] ' + msg + '</div>';
            console.log('[' + type + ']', msg);
        }

        // ============================================
        // CSV PARSING - SMART HEADER DETECTION
        // ============================================
        function parseCSVWithHeaders(text, headerKeyword) {
            var lines = text.split('\\n');
            var headerRowIndex = -1;
            var headers = [];
            
            // Find the header row by looking for the keyword
            for (var i = 0; i < Math.min(lines.length, 10); i++) {
                var line = lines[i].toLowerCase();
                if (line.indexOf(headerKeyword.toLowerCase()) !== -1) {
                    headerRowIndex = i;
                    break;
                }
            }
            
            if (headerRowIndex === -1) {
                debugLog('Could not find header row with: ' + headerKeyword, 'error');
                return [];
            }
            
            debugLog('Found header row at line ' + headerRowIndex, 'success');
            
            // Parse the header row
            headers = parseCSVLine(lines[headerRowIndex]);
            debugLog('Headers: ' + headers.slice(0, 5).join(', ') + '...', 'info');
            
            // Parse data rows
            var data = [];
            for (var i = headerRowIndex + 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                var values = parseCSVLine(lines[i]);
                var obj = {};
                for (var j = 0; j < headers.length; j++) {
                    var h = headers[j] ? headers[j].trim() : '';
                    obj[h] = values[j] ? values[j].trim() : '';
                }
                data.push(obj);
            }
            
            debugLog('Parsed ' + data.length + ' data rows', 'success');
            return data;
        }

        function parseCSVLine(line) {
            var result = [];
            var current = '';
            var inQuotes = false;
            
            for (var i = 0; i < line.length; i++) {
                var c = line.charAt(i);
                if (c === '"') {
                    inQuotes = !inQuotes;
                } else if (c === ',' && !inQuotes) {
                    result.push(current);
                    current = '';
                } else {
                    current += c;
                }
            }
            result.push(current);
            return result;
        }

        // ============================================
        // DATA FETCHING
        // ============================================
        function fetchSheet(gid, name, headerKeyword) {
            var url = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/export?format=csv&gid=' + gid;
            debugLog('Fetching ' + name + '...', 'info');
            
            return fetch(url)
                .then(function(response) {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    return response.text();
                })
                .then(function(text) {
                    debugLog(name + ' fetched: ' + text.length + ' bytes', 'success');
                    return parseCSVWithHeaders(text, headerKeyword);
                })
                .catch(function(error) {
                    debugLog('Error fetching ' + name + ': ' + error.message, 'error');
                    return [];
                });
        }

        // ============================================
        // INITIALIZATION
        // ============================================
        function init() {
            document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
            debugLog('Starting dashboard...', 'info');
            
            Promise.all([
                fetchSheet(MEMBER_REGISTRY_GID, 'Member Registry', 'Full Name'),
                fetchSheet(ALL_ATTENDANCE_GID, 'All Attendance', 'Full Name'),
                fetchSheet(GUEST_TRACKING_GID, 'Guest Tracking', 'First Name')
            ]).then(function(results) {
                var members = results[0];
                var attendance = results[1];
                var guests = results[2];
                
                // Process members
                memberData = members.filter(function(row) {
                    var name = row['Full Name'] || '';
                    return name && name !== 'Full Name' && name.indexOf('MEMBER') === -1;
                }).map(function(row, idx) {
                    return {
                        id: idx + 1,
                        name: row['Full Name'] || '',
                        firstName: row['First Name'] || '',
                        lastName: row['Last Name'] || '',
                        email: row['Email'] || '',
                        contact: row['Contact'] || '',
                        dob: row['Date of Birth'] || '',
                        inducted: row['Date Inducted'] || '',
                        status: row['Status'] || 'Active',
                        category: row['Category'] || 'Rotaractor'
                    };
                });
                
                debugLog('Processed ' + memberData.length + ' members', 'success');
                
                // Store attendance
                attendanceData = attendance.filter(function(row) {
                    var name = row['Full Name'] || '';
                    return name && name !== 'Full Name' && name.indexOf('ALL ATTENDANCE') === -1;
                });
                
                debugLog('Processed ' + attendanceData.length + ' attendance records', 'success');
                
                // Process guests
                guestData = guests.filter(function(row) {
                    var name = row['First Name'] || '';
                    return name && name !== 'First Name' && name.indexOf('GUEST') === -1;
                }).map(function(row) {
                    return {
                        name: (row['First Name'] || '') + ' ' + (row['Last Name'] || ''),
                        firstName: row['First Name'] || '',
                        lastName: row['Last Name'] || '',
                        status: row['Status'] || 'NO ATTENDANCE'
                    };
                });
                
                debugLog('Processed ' + guestData.length + ' guests', 'success');
                
                // Calculate attendance and render
                calculateAttendance();
                setupEventListeners();
                renderAll();
                
                debugLog('Dashboard ready!', 'success');
            }).catch(function(error) {
                debugLog('Fatal error: ' + error.message, 'error');
            });
        }

        // ============================================
        // ATTENDANCE CALCULATION
        // ============================================
        function calculateAttendance() {
            memberData.forEach(function(member) {
                var records = attendanceData.filter(function(a) {
                    var name = a['Full Name'] || '';
                    var quarter = a['Quarter'] || '';
                    var matchName = name.toLowerCase() === member.name.toLowerCase();
                    var matchPeriod = currentPeriod === 'Annual' || quarter === currentPeriod ||
                        (currentPeriod === 'H1' && (quarter === 'Q1' || quarter === 'Q2')) ||
                        (currentPeriod === 'H2' && (quarter === 'Q3' || quarter === 'Q4'));
                    return matchName && matchPeriod;
                });
                
                member.businessMeetings = records.filter(function(a) { return a['Meeting Type'] === 'Business Meeting'; }).length;
                member.fellowshipMeetings = records.filter(function(a) { return a['Meeting Type'] === 'Fellowship Meeting'; }).length;
                member.projects = records.filter(function(a) { return a['Meeting Type'] === 'Project'; }).length;
                
                member.totalBusinessMeetings = 2;
                member.totalFellowshipMeetings = 2;
                member.totalProjects = 5;
                
                var total = member.totalBusinessMeetings + member.totalFellowshipMeetings;
                var attended = member.businessMeetings + member.fellowshipMeetings;
                member.overallPercentage = total > 0 ? Math.round((attended / total) * 100) : 0;
            });
        }

        // ============================================
        // UTILITY FUNCTIONS
        // ============================================
        function calculateAge(dob) {
            if (!dob) return '-';
            var d = new Date(dob);
            if (isNaN(d)) return '-';
            var today = new Date();
            var age = today.getFullYear() - d.getFullYear();
            if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age--;
            return age;
        }

        function calculateYears(date) {
            if (!date) return 0;
            var d = new Date(date);
            if (isNaN(d)) return 0;
            var today = new Date();
            var years = today.getFullYear() - d.getFullYear();
            if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) years--;
            return Math.max(0, years);
        }

        function isNewMember(inducted) {
            if (!inducted) return false;
            var d = new Date(inducted);
            if (isNaN(d)) return false;
            var sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return d > sixMonthsAgo;
        }

        function getProgressClass(pct) {
            if (pct >= 60) return 'good';
            if (pct >= 40) return 'warning';
            return 'danger';
        }

        function isGoodStanding(m) {
            var term = m.status && m.status.toLowerCase().indexOf('terminated') !== -1;
            return m.overallPercentage >= 60 && !term;
        }

        function getCommittees(name) { return COMMITTEE_ASSIGNMENTS[name] || []; }
        function isOnBoard(name) { return BOARD_MEMBERS.indexOf(name) !== -1; }

        function formatDate(d) {
            if (!d) return '-';
            var date = new Date(d);
            if (isNaN(date)) return '-';
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }

        // ============================================
        // EVENT LISTENERS
        // ============================================
        function setupEventListeners() {
            document.getElementById('periodSelect').onchange = function(e) {
                currentPeriod = e.target.value;
                calculateAttendance();
                renderAll();
            };
            document.getElementById('statusFilter').onchange = renderMembers;
            document.getElementById('committeeFilter').onchange = renderMembers;
            document.getElementById('searchInput').oninput = renderMembers;

            document.querySelectorAll('.tab-btn').forEach(function(btn) {
                btn.onclick = function(e) {
                    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
                    document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
                    e.target.classList.add('active');
                    document.getElementById(e.target.dataset.tab + '-tab').classList.add('active');
                };
            });

            document.querySelectorAll('#birthdayMonthFilter .filter-pill').forEach(function(p) {
                p.onclick = function(e) {
                    document.querySelectorAll('#birthdayMonthFilter .filter-pill').forEach(function(x) { x.classList.remove('active'); });
                    e.target.classList.add('active');
                    currentBirthdayMonth = e.target.dataset.month;
                    renderBirthdays();
                };
            });

            document.querySelectorAll('#anniversaryMonthFilter .filter-pill').forEach(function(p) {
                p.onclick = function(e) {
                    document.querySelectorAll('#anniversaryMonthFilter .filter-pill').forEach(function(x) { x.classList.remove('active'); });
                    e.target.classList.add('active');
                    currentAnniversaryMonth = e.target.dataset.month;
                    renderAnniversaries();
                };
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
            renderSummary();
        }

        function updateStats() {
            var active = memberData.filter(function(m) { return !m.status.toLowerCase().includes('terminated'); });
            var good = active.filter(function(m) { return isGoodStanding(m); }).length;
            var newM = active.filter(function(m) { return isNewMember(m.inducted); }).length;
            var activeG = guestData.filter(function(g) { return g.status !== 'NO ATTENDANCE'; }).length;

            document.getElementById('totalMembers').textContent = active.length;
            document.getElementById('goodStanding').textContent = good;
            document.getElementById('needsAttention').textContent = active.length - good;
            document.getElementById('activeGuests').textContent = activeG;
            document.getElementById('newMembers').textContent = newM;
        }

        function renderMembers() {
            var container = document.getElementById('memberCards');
            var statusF = document.getElementById('statusFilter').value;
            var commF = document.getElementById('committeeFilter').value;
            var search = document.getElementById('searchInput').value.toLowerCase();

            var filtered = memberData.filter(function(m) {
                if (search && m.name.toLowerCase().indexOf(search) === -1) return false;
                var term = m.status && m.status.toLowerCase().indexOf('terminated') !== -1;
                if (statusF === 'good' && (!isGoodStanding(m) || term)) return false;
                if (statusF === 'not-good' && (isGoodStanding(m) || term)) return false;
                if (statusF === 'new' && !isNewMember(m.inducted)) return false;
                if (commF !== 'all' && getCommittees(m.name).indexOf(commF) === -1) return false;
                return true;
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No members match filters</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(m) {
                var comms = getCommittees(m.name);
                var isNew = isNewMember(m.inducted);
                var board = isOnBoard(m.name);
                var years = calculateYears(m.inducted);
                var age = calculateAge(m.dob);
                var term = m.status && m.status.toLowerCase().indexOf('terminated') !== -1;
                var good = isGoodStanding(m);

                html += '<div class="member-card ' + (term ? '' : (good ? 'good-standing' : 'not-good-standing')) + '">';
                html += '<div class="card-header"><div class="member-name">' + m.name + '</div>';
                html += '<div class="member-badges">';
                html += term ? '<span class="badge badge-terminated">Terminated</span>' : '<span class="badge badge-member">Member</span>';
                if (isNew && !term) html += '<span class="badge badge-new">New</span>';
                if (board && !term) html += '<span class="badge badge-board">Board</span>';
                html += '</div></div>';
                
                html += '<div class="member-details">';
                html += '<p>📧 ' + (m.email || '-') + '</p>';
                html += '<p>📱 ' + (m.contact || '-') + '</p>';
                html += '<p>🎂 Age: ' + age + ' | 🗓️ Member for ' + years + ' year' + (years !== 1 ? 's' : '') + '</p>';
                html += '<p>📅 Inducted: ' + formatDate(m.inducted) + '</p>';
                if (comms.length > 0) {
                    html += '<p>🏷️ ';
                    comms.forEach(function(c) { html += '<span class="committee-tag">' + c + '</span>'; });
                    html += '</p>';
                }
                html += '</div>';

                if (!term) {
                    html += '<div class="progress-section">';
                    html += '<div class="progress-item"><div class="progress-label"><span>Business</span><span>' + m.businessMeetings + '/' + m.totalBusinessMeetings + '</span></div>';
                    html += '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(m.businessMeetings/m.totalBusinessMeetings*100) + '" style="width:' + Math.min(m.businessMeetings/m.totalBusinessMeetings*100,100) + '%"></div></div></div>';
                    
                    html += '<div class="progress-item"><div class="progress-label"><span>Fellowship</span><span>' + m.fellowshipMeetings + '/' + m.totalFellowshipMeetings + '</span></div>';
                    html += '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(m.fellowshipMeetings/m.totalFellowshipMeetings*100) + '" style="width:' + Math.min(m.fellowshipMeetings/m.totalFellowshipMeetings*100,100) + '%"></div></div></div>';
                    
                    html += '<div class="progress-item"><div class="progress-label"><span>Projects</span><span>' + m.projects + '/' + m.totalProjects + '</span></div>';
                    html += '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(m.projects/m.totalProjects*100) + '" style="width:' + Math.min(m.projects/m.totalProjects*100,100) + '%"></div></div></div>';
                    
                    html += '<div class="progress-item"><div class="progress-label"><span>Overall (60% req)</span><span>' + m.overallPercentage + '%</span></div>';
                    html += '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(m.overallPercentage) + '" style="width:' + Math.min(m.overallPercentage,100) + '%"></div></div></div>';
                    html += '</div>';
                } else {
                    html += '<p style="color:#7f8c8d;text-align:center;padding:20px">Terminated</p>';
                }
                html += '</div>';
            });
            
            container.innerHTML = html;
        }

        function renderGuests() {
            var container = document.getElementById('guestCards');
            var memberNames = memberData.map(function(m) { return m.name.toLowerCase(); });
            
            var filtered = guestData.filter(function(g) {
                return memberNames.indexOf(g.name.toLowerCase().trim()) === -1;
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No guests found</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(g) {
                var comms = getCommittees(g.name.trim());
                html += '<div class="member-card guest-card">';
                html += '<div class="card-header"><div class="member-name">' + g.name + '</div>';
                html += '<div class="member-badges"><span class="badge badge-guest">Guest</span></div></div>';
                html += '<div class="member-details"><p>📊 Status: <strong>' + g.status + '</strong></p>';
                if (comms.length > 0) {
                    html += '<p>🏷️ ';
                    comms.forEach(function(c) { html += '<span class="committee-tag">' + c + '</span>'; });
                    html += '</p>';
                }
                html += '</div></div>';
            });
            
            container.innerHTML = html;
        }

        function renderBirthdays() {
            var container = document.getElementById('birthdayList');
            var months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            
            var filtered = memberData.filter(function(m) {
                if (!m.dob || m.status.toLowerCase().indexOf('terminated') !== -1) return false;
                var d = new Date(m.dob);
                if (isNaN(d)) return false;
                if (currentBirthdayMonth === 'all') return true;
                return (d.getMonth() + 1) === parseInt(currentBirthdayMonth);
            }).sort(function(a,b) {
                var da = new Date(a.dob), db = new Date(b.dob);
                return da.getMonth() - db.getMonth() || da.getDate() - db.getDate();
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No birthdays</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(m) {
                var d = new Date(m.dob);
                html += '<div class="celebration-card"><div class="celebration-icon">🎂</div>';
                html += '<div class="celebration-info"><h4>' + m.name + '</h4>';
                html += '<p>' + months[d.getMonth()+1] + ' ' + d.getDate() + ' • Turning ' + (calculateAge(m.dob)+1) + '</p></div></div>';
            });
            container.innerHTML = html;
        }

        function renderAnniversaries() {
            var container = document.getElementById('anniversaryList');
            var months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            
            var filtered = memberData.filter(function(m) {
                if (!m.inducted || m.status.toLowerCase().indexOf('terminated') !== -1) return false;
                var d = new Date(m.inducted);
                if (isNaN(d)) return false;
                if (currentAnniversaryMonth === 'all') return true;
                return (d.getMonth() + 1) === parseInt(currentAnniversaryMonth);
            }).sort(function(a,b) {
                var da = new Date(a.inducted), db = new Date(b.inducted);
                return da.getMonth() - db.getMonth() || da.getDate() - db.getDate();
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No anniversaries</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(m) {
                var d = new Date(m.inducted);
                var yrs = calculateYears(m.inducted) + 1;
                html += '<div class="celebration-card"><div class="celebration-icon">🎉</div>';
                html += '<div class="celebration-info"><h4>' + m.name + '</h4>';
                html += '<p>' + months[d.getMonth()+1] + ' ' + d.getDate() + ' • ' + yrs + ' year' + (yrs!==1?'s':'') + '</p></div></div>';
            });
            container.innerHTML = html;
        }

        function renderSummary() {
            var tbody = document.getElementById('summaryBody');
            var active = memberData.filter(function(m) { return m.status.toLowerCase().indexOf('terminated') === -1; });

            var html = '';
            active.forEach(function(m) {
                var comms = getCommittees(m.name);
                var good = isGoodStanding(m);
                html += '<tr><td>' + m.name + '</td><td>' + (comms.join(', ') || '-') + '</td>';
                html += '<td>' + m.businessMeetings + '/' + m.totalBusinessMeetings + '</td>';
                html += '<td>' + m.fellowshipMeetings + '/' + m.totalFellowshipMeetings + '</td>';
                html += '<td>' + m.projects + '/' + m.totalProjects + '</td>';
                html += '<td>' + m.overallPercentage + '%</td>';
                html += '<td style="color:' + (good ? '#27ae60' : '#e74c3c') + '">' + (good ? '✅' : '⚠️') + '</td></tr>';
            });
            tbody.innerHTML = html;
        }

        // ============================================
        // EXPORT FUNCTIONS
        // ============================================
        function exportBirthdays() {
            var data = memberData.filter(function(m) { return m.dob && m.status.toLowerCase().indexOf('terminated') === -1; });
            var csv = 'Name,Month,Day,Age\\n';
            data.forEach(function(m) {
                var d = new Date(m.dob);
                if (!isNaN(d)) csv += m.name + ',' + (d.getMonth()+1) + ',' + d.getDate() + ',' + (calculateAge(m.dob)+1) + '\\n';
            });
            downloadCSV(csv, 'RCUG_Birthdays.csv');
        }

        function exportAnniversaries() {
            var data = memberData.filter(function(m) { return m.inducted && m.status.toLowerCase().indexOf('terminated') === -1; });
            var csv = 'Name,Month,Day,Years\\n';
            data.forEach(function(m) {
                var d = new Date(m.inducted);
                if (!isNaN(d)) csv += m.name + ',' + (d.getMonth()+1) + ',' + d.getDate() + ',' + (calculateYears(m.inducted)+1) + '\\n';
            });
            downloadCSV(csv, 'RCUG_Anniversaries.csv');
        }

        function exportSummary() {
            var csv = 'Name,Committee,Business,Fellowship,Projects,Overall,Status\\n';
            memberData.filter(function(m) { return m.status.toLowerCase().indexOf('terminated') === -1; }).forEach(function(m) {
                csv += m.name + ',"' + getCommittees(m.name).join('; ') + '",' + m.businessMeetings + '/' + m.totalBusinessMeetings + ',';
                csv += m.fellowshipMeetings + '/' + m.totalFellowshipMeetings + ',' + m.projects + '/' + m.totalProjects + ',';
                csv += m.overallPercentage + '%,' + (isGoodStanding(m) ? 'Good' : 'Check') + '\\n';
            });
            downloadCSV(csv, 'RCUG_Summary.csv');
        }

        function downloadCSV(csv, filename) {
            var blob = new Blob([csv], { type: 'text/csv' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>`;
