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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); min-height: 100vh; color: #fff; padding: 20px; }
        .container { max-width: 1600px; margin: 0 auto; }
        header { text-align: center; padding: 20px; margin-bottom: 30px; background: rgba(255,255,255,0.1); border-radius: 15px; backdrop-filter: blur(10px); }
        h1 { font-size: 2.5rem; background: linear-gradient(90deg, #f39c12, #e74c3c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 10px; }
        .subtitle { color: #bdc3c7; font-size: 1.1rem; }
        .loading { text-align: center; padding: 60px; font-size: 1.2rem; color: #f1c40f; }
        .error { text-align: center; padding: 40px; color: #e74c3c; background: rgba(231,76,60,0.1); border-radius: 10px; margin: 20px 0; }
        .controls { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-bottom: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; }
        .control-group { display: flex; flex-direction: column; gap: 5px; }
        .control-group label { font-size: 0.85rem; color: #bdc3c7; text-transform: uppercase; letter-spacing: 1px; }
        select, input[type="text"] { padding: 10px 15px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: #fff; font-size: 1rem; cursor: pointer; min-width: 180px; }
        select:focus, input:focus { outline: 2px solid #f39c12; }
        select option { background: #1a1a2e; color: #fff; }
        .refresh-btn { padding: 10px 20px; border: none; border-radius: 8px; background: #3498db; color: #fff; font-size: 1rem; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .refresh-btn:hover { background: #2980b9; transform: scale(1.02); }
        .stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center; backdrop-filter: blur(5px); }
        .stat-card h3 { font-size: 2rem; color: #f39c12; }
        .stat-card p { color: #bdc3c7; font-size: 0.9rem; margin-top: 5px; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab-btn { padding: 12px 24px; border: none; border-radius: 10px; background: rgba(255,255,255,0.1); color: #fff; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .tab-btn.active { background: linear-gradient(90deg, #f39c12, #e74c3c); }
        .tab-btn:hover:not(.active) { background: rgba(255,255,255,0.2); }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .section-title { font-size: 1.5rem; margin: 20px 0; padding-bottom: 10px; border-bottom: 2px solid #f39c12; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .export-btn { background: linear-gradient(90deg, #27ae60, #2ecc71); border: none; padding: 10px 20px; border-radius: 8px; color: #fff; font-size: 0.9rem; cursor: pointer; font-weight: 600; transition: transform 0.2s; }
        .export-btn:hover { transform: scale(1.05); }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .member-card { background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); border-radius: 15px; padding: 20px; position: relative; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; cursor: pointer; border-left: 4px solid #27ae60; }
        .member-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .member-card.good-standing { border-left-color: #27ae60; }
        .member-card.not-good-standing { border-left-color: #e74c3c; }
        .member-card.guest-card { border-left-color: #3498db; }
        .member-card.terminated { border-left-color: #7f8c8d; opacity: 0.7; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
        .member-name { font-size: 1.2rem; font-weight: 600; padding-right: 10px; }
        .member-tag { font-size: 0.8rem; color: #bdc3c7; margin-top: 3px; }
        .badges { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
        .badge { font-size: 0.65rem; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; font-weight: 600; }
        .badge-new { background: linear-gradient(90deg, #9b59b6, #8e44ad); animation: pulse 2s infinite; }
        .badge-board { background: #f39c12; color: #000; }
        .badge-years { background: #1abc9c; }
        .badge-terminated { background: #7f8c8d; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .status-badge { padding: 4px 12px; border-radius: 15px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
        .status-good { background: #27ae60; }
        .status-notgood { background: #e74c3c; }
        .status-terminated { background: #7f8c8d; }
        .committee-tags { margin-top: 8px; }
        .committee-tag { display: inline-block; background: rgba(243, 156, 18, 0.3); padding: 2px 8px; border-radius: 4px; margin: 2px 2px 2px 0; font-size: 0.7rem; color: #f39c12; }
        .card-actions { position: absolute; top: 10px; right: 10px; }
        .card-action-btn { background: rgba(255,255,255,0.2); border: none; border-radius: 5px; padding: 5px 10px; color: #fff; cursor: pointer; font-size: 0.7rem; transition: all 0.3s; }
        .card-action-btn:hover { background: rgba(255,255,255,0.4); }
        .progress-section { margin-top: 15px; }
        .progress-item { margin-bottom: 10px; }
        .progress-label { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px; color: #bdc3c7; }
        .progress-bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
        .progress-fill.good { background: linear-gradient(90deg, #27ae60, #2ecc71); }
        .progress-fill.warning { background: linear-gradient(90deg, #f39c12, #e67e22); }
        .progress-fill.danger { background: linear-gradient(90deg, #e74c3c, #c0392b); }
        .progress-fill.meetings { background: linear-gradient(90deg, #3498db, #2980b9); }
        .progress-fill.projects { background: linear-gradient(90deg, #e74c3c, #c0392b); }
        .checklist { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); }
        .checklist-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
        .checklist-item.completed { color: #27ae60; }
        .checklist-item.pending { color: #e74c3c; }
        .filter-pills { display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0; }
        .filter-pill { padding: 8px 16px; border-radius: 20px; background: rgba(255,255,255,0.1); font-size: 0.85rem; cursor: pointer; transition: all 0.3s; border: none; color: #fff; }
        .filter-pill:hover, .filter-pill.active { background: #f39c12; }
        .celebration-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 15px; }
        .celebration-card { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 15px; }
        .celebration-icon { font-size: 2.5rem; }
        .celebration-info h4 { font-size: 1rem; margin-bottom: 3px; }
        .celebration-info p { font-size: 0.85rem; color: #bdc3c7; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
        .summary-table th, .summary-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .summary-table th { background: rgba(243, 156, 18, 0.2); font-weight: 600; text-transform: uppercase; font-size: 0.8rem; }
        .summary-table tr:hover { background: rgba(255,255,255,0.05); }
        .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
        .modal-content { background: linear-gradient(135deg, #2c3e50, #1a1a2e); border-radius: 20px; padding: 30px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; }
        .close-btn { position: absolute; top: 15px; right: 20px; font-size: 2rem; cursor: pointer; color: #bdc3c7; background: none; border: none; }
        .close-btn:hover { color: #e74c3c; }
        .modal-header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .modal-name { font-size: 1.8rem; margin-bottom: 5px; }
        .modal-email { color: #bdc3c7; font-size: 0.9rem; }
        .modal-contact { color: #3498db; font-size: 0.9rem; margin-top: 5px; }
        .detail-section { margin-bottom: 25px; }
        .detail-title { font-size: 1.1rem; font-weight: 600; color: #f1c40f; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid rgba(241,196,15,0.3); }
        .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .detail-card { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 15px; }
        .detail-card.full-width { grid-column: 1 / -1; }
        .detail-label { font-size: 0.75rem; color: #95a5a6; margin-bottom: 5px; text-transform: uppercase; }
        .detail-value { font-size: 0.95rem; color: #ecf0f1; }
        .meeting-list { max-height: 200px; overflow-y: auto; }
        .meeting-item { padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 5px; margin-bottom: 5px; font-size: 0.85rem; display: flex; justify-content: space-between; }
        .meeting-date { color: #3498db; font-weight: 600; }
        .meeting-type { color: #bdc3c7; }
        .no-data { text-align: center; padding: 40px; color: #7f8c8d; font-size: 1.1rem; }
        @media (max-width: 768px) {
            h1 { font-size: 1.8rem; }
            .cards-grid { grid-template-columns: 1fr; }
            .controls { flex-direction: column; align-items: stretch; }
            select, input { width: 100%; }
            .detail-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>RCUG Member Progress Dashboard</h1>
            <p class="subtitle">Rotaract Club of University of Guyana | Rotary Year 2025-2026</p>
            <p class="subtitle" style="margin-top: 10px; font-size: 0.9rem;">Last Updated: <span id="lastUpdated">Loading...</span></p>
        </header>
        <div id="loadingMessage" class="loading">Loading dashboard data...</div>
        <div id="errorMessage" class="error" style="display:none;"></div>
        <div id="mainContent" style="display:none;">
            <div class="controls">
                <div class="control-group">
                    <label>View Period</label>
                    <select id="periodSelect">
                        <option value="q1">Q1 (Jul-Sep)</option>
                        <option value="q2" selected>Q2 (Oct-Dec)</option>
                        <option value="h1">H1 (Jul-Dec)</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Filter Status</label>
                    <select id="statusFilter">
                        <option value="all">All Members</option>
                        <option value="good">Good Standing</option>
                        <option value="notgood">Needs Attention</option>
                        <option value="terminated">Terminated</option>
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
                <div class="control-group">
                    <label>&nbsp;</label>
                    <button class="refresh-btn" onclick="loadAllData()">Refresh Data</button>
                </div>
            </div>
            <div class="stats-bar">
                <div class="stat-card"><h3 id="totalMembers">0</h3><p>Total Members</p></div>
                <div class="stat-card"><h3 id="goodStanding">0</h3><p>Good Standing</p></div>
                <div class="stat-card"><h3 id="needsAttention">0</h3><p>Needs Attention</p></div>
                <div class="stat-card"><h3 id="totalGuests">0</h3><p>Active Guests</p></div>
                <div class="stat-card"><h3 id="newMembers">0</h3><p>New Members</p></div>
            </div>
            <div class="tabs">
                <button class="tab-btn active" data-tab="members">Members</button>
                <button class="tab-btn" data-tab="guests">Guest Progress</button>
                <button class="tab-btn" data-tab="birthdays">Birthdays</button>
                <button class="tab-btn" data-tab="anniversaries">Anniversaries</button>
                <button class="tab-btn" data-tab="summary">Summary Table</button>
            </div>
            <div class="tab-content active" id="members-tab">
                <div class="section-title"><span>Member Attendance & Standing</span></div>
                <div class="cards-grid" id="memberGrid"></div>
            </div>
            <div class="tab-content" id="guests-tab">
                <div class="section-title"><span>Guest Progress Toward Membership</span></div>
                <div class="cards-grid" id="guestGrid"></div>
            </div>
            <div class="tab-content" id="birthdays-tab">
                <div class="section-title">
                    <span>Member Birthdays</span>
                    <button class="export-btn" onclick="exportBirthdays()">Export CSV</button>
                </div>
                <div class="filter-pills" id="birthdayMonthFilter"></div>
                <div class="celebration-list" id="birthdayList"></div>
            </div>
            <div class="tab-content" id="anniversaries-tab">
                <div class="section-title">
                    <span>Induction Anniversaries</span>
                    <button class="export-btn" onclick="exportAnniversaries()">Export CSV</button>
                </div>
                <div class="filter-pills" id="anniversaryMonthFilter"></div>
                <div class="celebration-list" id="anniversaryList"></div>
            </div>
            <div class="tab-content" id="summary-tab">
                <div class="section-title">
                    <span>Attendance Summary</span>
                    <button class="export-btn" onclick="exportSummary()">Export CSV</button>
                </div>
                <table class="summary-table">
                    <thead><tr><th>Name</th><th>Committee(s)</th><th>Meetings</th><th>Projects</th><th>Overall %</th><th>Status</th></tr></thead>
                    <tbody id="summaryBody"></tbody>
                </table>
            </div>
        </div>
    </div>
    <div id="memberModal" class="modal">
        <div class="modal-content">
            <button class="close-btn" onclick="closeModal()">&times;</button>
            <div id="modalContent"></div>
            <div style="text-align: center; margin-top: 20px;">
                <button class="export-btn" onclick="exportCurrentMember()">Export to PDF</button>
            </div>
        </div>
    </div>
    <script>
        var SHEET_ID = '1j0uOvYCe-DvOsPjxyb7RfLm7ddeB_LL99cJKeO40RaM';
        var GUEST_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv&gid=1284804990';
        var MEMBER_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv&gid=1821690489';
        var BOARD_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv&gid=419776584';
        var ATTENDANCE_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv&gid=1315129184';

        var TOTALS = { q1: { meetings: 6, projects: 5 }, q2: { meetings: 5, projects: 5 }, h1: { meetings: 11, projects: 10 } };
        var BOARD_MEMBERS = ['Adanna Edwards', 'Andrew Hing', 'Christine Samuels', 'Darin Hall', 'Ganesh Anand', 'Jemima Stephenson', 'Kadeem Bowen', 'Nandita Singh', 'Omari London', 'Ruth Manbodh', 'Vishal Roopnarine', 'Yushina Ramlall'];
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
            'Brittany Ross': [],
            'Patrick Bacchus': [],
            'Randolph Benn': []
        };
        var EXCLUDED_NAMES = ['MEMBER REGISTRY', 'Full Name', 'Training', 'Assistant Secretary', 'Rotary Foundation', 'Membership Chair', 'Hobbies', 'Playing Games', 'Jogging', 'Going for long', 'Performing Arts', 'Athletics', 'CLUB REGISTER', 'GUEST'];

        // Meeting schedule - all meetings that have occurred
        var MEETING_SCHEDULE = {
            q1: [
                { date: '2024-07-13', name: 'July Business Meeting', type: 'Business Meeting' },
                { date: '2024-07-27', name: 'July Fellowship', type: 'Fellowship Meeting' },
                { date: '2024-08-10', name: 'August Business Meeting', type: 'Business Meeting' },
                { date: '2024-08-24', name: 'August Fellowship', type: 'Fellowship Meeting' },
                { date: '2024-09-14', name: 'September Business Meeting', type: 'Business Meeting' },
                { date: '2024-09-28', name: 'September Fellowship', type: 'Fellowship Meeting' }
            ],
            q2: [
                { date: '2024-10-12', name: 'October Business Meeting', type: 'Business Meeting' },
                { date: '2024-10-26', name: 'October Fellowship', type: 'Fellowship Meeting' },
                { date: '2024-11-09', name: 'November Business Meeting', type: 'Business Meeting' },
                { date: '2024-11-23', name: 'November Fellowship', type: 'Fellowship Meeting' },
                { date: '2024-12-07', name: 'December Business Meeting', type: 'Business Meeting' }
            ]
        };
        MEETING_SCHEDULE.h1 = MEETING_SCHEDULE.q1.concat(MEETING_SCHEDULE.q2);

        var members = [];
        var guests = [];
        var allAttendance = [];
        var boardAttendance = {};
        var currentPeriod = 'q2';
        var currentBirthdayMonth = 'all';
        var currentAnniversaryMonth = 'all';
        var currentMemberForExport = null;

        function getCommittees(name) { return COMMITTEE_ASSIGNMENTS[name] || []; }
        function isExcludedName(name) {
            if (!name) return true;
            var lower = name.toLowerCase();
            for (var i = 0; i < EXCLUDED_NAMES.length; i++) {
                if (lower.indexOf(EXCLUDED_NAMES[i].toLowerCase()) !== -1) return true;
            }
            return false;
        }
        function formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) return 'N/A';
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        }
        function calculateAge(dateStr) {
            if (!dateStr) return null;
            var birthDate = new Date(dateStr);
            if (isNaN(birthDate.getTime())) return null;
            var today = new Date();
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            return age;
        }
        function getYearsOfService(dateStr) {
            if (!dateStr) return null;
            var inducted = new Date(dateStr);
            if (isNaN(inducted.getTime())) return null;
            var today = new Date();
            var years = today.getFullYear() - inducted.getFullYear();
            var m = today.getMonth() - inducted.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < inducted.getDate())) years--;
            return Math.max(0, years);
        }
        function isNewMember(dateStr) {
            if (!dateStr) return false;
            var inducted = new Date(dateStr);
            if (isNaN(inducted.getTime())) return false;
            var sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return inducted > sixMonthsAgo;
        }
        function isGoodStanding(m) {
            if (m.isTerminated) return false;
            var pct = (m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100;
            return pct >= 60;
        }

        function fetchCSV(url, name) {
            return fetch(url).then(function(response) {
                if (!response.ok) throw new Error(name + ': HTTP ' + response.status);
                return response.text();
            }).then(function(text) {
                return new Promise(function(resolve) {
                    Papa.parse(text, { header: false, skipEmptyLines: true, complete: function(r) { resolve(r.data); } });
                });
            });
        }

        function loadAllData() {
            document.getElementById('loadingMessage').style.display = 'block';
            document.getElementById('mainContent').style.display = 'none';
            document.getElementById('errorMessage').style.display = 'none';

            Promise.all([
                fetchCSV(GUEST_URL, 'Guests').catch(function() { return []; }),
                fetchCSV(MEMBER_URL, 'Members').catch(function() { return []; }),
                fetchCSV(BOARD_URL, 'Board').catch(function() { return []; }),
                fetchCSV(ATTENDANCE_URL, 'Attendance').catch(function() { return []; })
            ]).then(function(results) {
                var guestData = results[0];
                var memberData = results[1];
                var boardData = results[2];
                var attData = results[3];

                if (memberData.length === 0) throw new Error('Could not load member data');

                processAttendance(attData);
                processBoard(boardData);
                processMembers(memberData);
                processGuests(guestData);
                calculateMemberStats();

                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                document.getElementById('lastUpdated').textContent = new Date().toLocaleString();

                setupEventListeners();
                renderAll();
            }).catch(function(error) {
                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('errorMessage').style.display = 'block';
                document.getElementById('errorMessage').innerHTML = '<h3>Error Loading Data</h3><p>' + error.message + '</p>';
            });
        }

        function processAttendance(data) {
            allAttendance = [];
            if (!data.length) return;
            var hdr = -1;
            for (var i = 0; i < Math.min(10, data.length); i++) {
                if (data[i][0] === 'Full Name') { hdr = i; break; }
            }
            for (var i = (hdr >= 0 ? hdr : 2) + 1; i < data.length; i++) {
                var r = data[i];
                if (!r[0] || isExcludedName(r[0])) continue;
                allAttendance.push({
                    name: r[0].toString().trim(),
                    type: (r[7] || '').toString().trim(),
                    quarter: (r[9] || '').toString().trim(),
                    dateFormatted: formatDate(r[6])
                });
            }
        }

        function processBoard(data) {
            boardAttendance = {};
            if (!data.length) return;
            var currentQuarter = 0;
            for (var i = 0; i < data.length; i++) {
                var r = data[i];
                if (r[0] && r[0].toString().indexOf('QUARTER') !== -1) { currentQuarter++; continue; }
                if (r[0] === 'First Name' || !r[0] || r[0] === 'Total') continue;
                var name = ((r[0] || '') + ' ' + (r[1] || '')).trim();
                if (!name) continue;
                if (!boardAttendance[name]) boardAttendance[name] = { total: 0, q1: 0, q2: 0 };
                var qTotal = 0;
                for (var j = 2; j <= 4; j++) { if (r[j] == 1 || r[j] === '1') qTotal++; }
                if (currentQuarter === 1) boardAttendance[name].q1 = qTotal;
                else if (currentQuarter === 2) boardAttendance[name].q2 = qTotal;
                boardAttendance[name].total = boardAttendance[name].q1 + boardAttendance[name].q2;
            }
        }

        function processMembers(data) {
            members = [];
            if (!data.length) return;
            var hdr = -1;
            for (var i = 0; i < Math.min(10, data.length); i++) {
                if (data[i][0] === 'ID' || (data[i][1] && data[i][1].toString().indexOf('Full Name') !== -1)) { hdr = i; break; }
            }
            if (hdr === -1) hdr = 0;
            for (var i = hdr + 1; i < data.length; i++) {
                var r = data[i];
                var name = (r[1] || '').toString().trim();
                if (!name || name === 'Full Name' || isExcludedName(name)) continue;
                var registryStatus = (r[10] || '').toString().trim();
                var isTerminated = registryStatus.toLowerCase().indexOf('terminated') !== -1;
                var isBoardMember = BOARD_MEMBERS.indexOf(name) !== -1;
                members.push({
                    fullName: name,
                    firstName: (r[2] || '').toString().trim(),
                    lastName: (r[3] || '').toString().trim(),
                    email: (r[4] || '').toString().trim(),
                    contact: (r[5] || '').toString().trim(),
                    dateOfBirth: r[6] || '',
                    age: calculateAge(r[6]),
                    dateInducted: r[7] || '',
                    yearsOfService: getYearsOfService(r[7]),
                    category: (r[8] || 'Rotaractor').toString().trim(),
                    isNewMember: isNewMember(r[7]),
                    isBoardMember: isBoardMember,
                    isTerminated: isTerminated,
                    meetings: { q1: 0, q2: 0, h1: 0 },
                    projects: { q1: 0, q2: 0, h1: 0 },
                    meetingDetails: { q1: [], q2: [], h1: [] },
                    missedMeetings: { q1: [], q2: [], h1: [] },
                    boardMeetings: isBoardMember && boardAttendance[name] ? boardAttendance[name] : null
                });
            }
        }

        function processGuests(data) {
            guests = [];
            if (!data.length) return;
            var hdr = -1;
            for (var i = 0; i < Math.min(10, data.length); i++) {
                if (data[i][0] === 'First Name') { hdr = i; break; }
            }
            var map = {};
            for (var i = (hdr >= 0 ? hdr : 2) + 1; i < data.length; i++) {
                var r = data[i];
                if (!r[0] || r[0] === 'First Name') continue;
                var name = ((r[0] || '') + ' ' + (r[1] || '')).trim();
                if (!name || isExcludedName(name)) continue;
                var isMember = false;
                for (var j = 0; j < members.length; j++) { if (members[j].fullName === name) { isMember = true; break; } }
                if (isMember) continue;
                if (!map[name]) {
                    map[name] = { fullName: name, meetings: 0, projects: 0, info: false, committee: false, ug: false };
                }
                for (var j = 3; j <= 8; j++) { if (r[j] == 1 || r[j] === 'TRUE' || r[j] === '1') map[name].meetings++; }
                for (var j = 12; j <= 22; j++) { if (r[j] == 1 || r[j] === 'TRUE' || r[j] === '1') map[name].projects++; }
                if (r[24] === 'TRUE' || r[24] == 1) map[name].info = true;
                if (r[25] === 'TRUE' || r[25] == 1) map[name].committee = true;
                if (r[26] === 'TRUE' || r[26] == 1) map[name].ug = true;
            }
            for (var name in map) {
                var g = map[name];
                g.meetings = Math.min(g.meetings, TOTALS.h1.meetings);
                g.projects = Math.min(g.projects, TOTALS.h1.projects);
                g.meetPct = (g.meetings / TOTALS.h1.meetings) * 100;
                g.projPct = (g.projects / TOTALS.h1.projects) * 100;
                guests.push(g);
            }
        }

        function calculateMemberStats() {
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                var periods = ['q1', 'q2', 'h1'];
                for (var p = 0; p < periods.length; p++) {
                    var period = periods[p];
                    var att = [];
                    for (var j = 0; j < allAttendance.length; j++) {
                        var a = allAttendance[j];
                        if (a.name !== m.fullName) continue;
                        if (period === 'h1' && (a.quarter === 'Q1' || a.quarter === 'Q2')) att.push(a);
                        else if (a.quarter === period.toUpperCase()) att.push(a);
                    }
                    var meetCount = 0, projCount = 0;
                    var attendedDates = [];
                    for (var j = 0; j < att.length; j++) {
                        if (att[j].type === 'Business Meeting' || att[j].type === 'Fellowship Meeting') {
                            meetCount++;
                            attendedDates.push(att[j].dateFormatted);
                        }
                        if (att[j].type === 'Project') projCount++;
                        m.meetingDetails[period].push({ date: att[j].dateFormatted, type: att[j].type });
                    }
                    m.meetings[period] = meetCount;
                    m.projects[period] = projCount;
                    
                    // Calculate missed meetings
                    if (MEETING_SCHEDULE[period]) {
                        for (var k = 0; k < MEETING_SCHEDULE[period].length; k++) {
                            var scheduled = MEETING_SCHEDULE[period][k];
                            var scheduledFormatted = formatDate(scheduled.date);
                            var wasAttended = false;
                            for (var x = 0; x < attendedDates.length; x++) {
                                if (attendedDates[x] === scheduledFormatted) { wasAttended = true; break; }
                            }
                            if (!wasAttended) {
                                m.missedMeetings[period].push({ date: scheduledFormatted, name: scheduled.name, type: scheduled.type });
                            }
                        }
                    }
                }
            }
        }

        function setupEventListeners() {
            document.getElementById('periodSelect').onchange = function(e) { currentPeriod = e.target.value; renderAll(); };
            document.getElementById('statusFilter').onchange = renderMembers;
            document.getElementById('committeeFilter').onchange = renderMembers;
            document.getElementById('searchInput').oninput = renderMembers;
            var tabBtns = document.querySelectorAll('.tab-btn');
            for (var i = 0; i < tabBtns.length; i++) {
                tabBtns[i].onclick = function(e) {
                    var allBtns = document.querySelectorAll('.tab-btn');
                    var allTabs = document.querySelectorAll('.tab-content');
                    for (var j = 0; j < allBtns.length; j++) allBtns[j].classList.remove('active');
                    for (var j = 0; j < allTabs.length; j++) allTabs[j].classList.remove('active');
                    e.target.classList.add('active');
                    document.getElementById(e.target.getAttribute('data-tab') + '-tab').classList.add('active');
                };
            }
            document.getElementById('memberModal').onclick = function(e) { if (e.target.id === 'memberModal') closeModal(); };
            buildMonthFilters();
        }

        function buildMonthFilters() {
            var months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var bdayHtml = '', annivHtml = '';
            for (var i = 0; i < months.length; i++) {
                var val = i === 0 ? 'all' : i;
                var active = i === 0 ? ' active' : '';
                bdayHtml += '<button class="filter-pill' + active + '" data-month="' + val + '">' + months[i] + '</button>';
                annivHtml += '<button class="filter-pill' + active + '" data-month="' + val + '">' + months[i] + '</button>';
            }
            document.getElementById('birthdayMonthFilter').innerHTML = bdayHtml;
            document.getElementById('anniversaryMonthFilter').innerHTML = annivHtml;
            var bdayPills = document.querySelectorAll('#birthdayMonthFilter .filter-pill');
            for (var i = 0; i < bdayPills.length; i++) {
                bdayPills[i].onclick = function(e) {
                    var all = document.querySelectorAll('#birthdayMonthFilter .filter-pill');
                    for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
                    e.target.classList.add('active');
                    currentBirthdayMonth = e.target.getAttribute('data-month');
                    renderBirthdays();
                };
            }
            var annivPills = document.querySelectorAll('#anniversaryMonthFilter .filter-pill');
            for (var i = 0; i < annivPills.length; i++) {
                annivPills[i].onclick = function(e) {
                    var all = document.querySelectorAll('#anniversaryMonthFilter .filter-pill');
                    for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
                    e.target.classList.add('active');
                    currentAnniversaryMonth = e.target.getAttribute('data-month');
                    renderAnniversaries();
                };
            }
        }

        function renderAll() {
            updateStats();
            renderMembers();
            renderGuests();
            renderBirthdays();
            renderAnniversaries();
            renderSummary();
        }

        function updateStats() {
            var active = [], good = 0, newM = 0;
            for (var i = 0; i < members.length; i++) {
                if (!members[i].isTerminated) {
                    active.push(members[i]);
                    if (isGoodStanding(members[i])) good++;
                    if (members[i].isNewMember) newM++;
                }
            }
            document.getElementById('totalMembers').textContent = active.length;
            document.getElementById('goodStanding').textContent = good;
            document.getElementById('needsAttention').textContent = active.length - good;
            document.getElementById('totalGuests').textContent = guests.length;
            document.getElementById('newMembers').textContent = newM;
        }

        function renderMembers() {
            var statusF = document.getElementById('statusFilter').value;
            var commF = document.getElementById('committeeFilter').value;
            var search = document.getElementById('searchInput').value.toLowerCase();
            var filtered = [];
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                if (search && m.fullName.toLowerCase().indexOf(search) === -1) continue;
                if (statusF === 'good' && !isGoodStanding(m)) continue;
                if (statusF === 'notgood' && (isGoodStanding(m) || m.isTerminated)) continue;
                if (statusF === 'terminated' && !m.isTerminated) continue;
                if (commF !== 'all') {
                    var comms = getCommittees(m.fullName);
                    var hasComm = false;
                    for (var j = 0; j < comms.length; j++) { if (comms[j] === commF) hasComm = true; }
                    if (!hasComm) continue;
                }
                filtered.push(m);
            }
            var grid = document.getElementById('memberGrid');
            if (filtered.length === 0) { grid.innerHTML = '<div class="no-data">No members match filters</div>'; return; }
            var html = '';
            for (var i = 0; i < filtered.length; i++) html += renderMemberCard(filtered[i], i);
            grid.innerHTML = html;
            var cards = document.querySelectorAll('.member-card[data-index]');
            for (var i = 0; i < cards.length; i++) {
                cards[i].onclick = function(e) {
                    if (e.target.classList.contains('card-action-btn')) return;
                    var idx = parseInt(this.getAttribute('data-index'));
                    showMemberDetails(idx);
                };
            }
            var exportBtns = document.querySelectorAll('.card-action-btn');
            for (var i = 0; i < exportBtns.length; i++) {
                exportBtns[i].onclick = function(e) {
                    e.stopPropagation();
                    var idx = parseInt(this.getAttribute('data-export'));
                    exportMemberCard(idx);
                };
            }
        }

        function renderMemberCard(m, idx) {
            var pct = Math.round((m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100);
            var projPct = Math.round((m.projects[currentPeriod] / TOTALS[currentPeriod].projects) * 100);
            var committees = getCommittees(m.fullName);
            var statusClass = 'good-standing', statusText = 'Good Standing';
            if (m.isTerminated) { statusClass = 'terminated'; statusText = 'Terminated'; }
            else if (pct < 60) { statusClass = 'not-good-standing'; statusText = 'Needs Attention'; }
            var badges = '';
            if (m.isNewMember) badges += '<span class="badge badge-new">NEW</span>';
            if (m.isBoardMember) badges += '<span class="badge badge-board">BOARD</span>';
            if (m.yearsOfService !== null && m.yearsOfService >= 0) badges += '<span class="badge badge-years">' + m.yearsOfService + 'yr' + (m.yearsOfService !== 1 ? 's' : '') + '</span>';
            if (m.isTerminated) badges += '<span class="badge badge-terminated">TERMINATED</span>';
            var committeeTags = '';
            if (committees.length > 0) {
                committeeTags = '<div class="committee-tags">';
                for (var i = 0; i < committees.length; i++) committeeTags += '<span class="committee-tag">' + committees[i] + '</span>';
                committeeTags += '</div>';
            }
            var statusBadgeClass = statusClass === 'good-standing' ? 'good' : (statusClass === 'not-good-standing' ? 'notgood' : 'terminated');
            return '<div class="member-card ' + statusClass + '" data-index="' + idx + '">' +
                '<div class="card-actions"><button class="card-action-btn" data-export="' + idx + '">Export</button></div>' +
                '<div class="card-header"><div>' +
                '<div class="member-name">' + m.fullName + '</div>' +
                '<div class="member-tag">' + m.category + '</div>' +
                '<div class="badges">' + badges + '</div>' + committeeTags +
                '</div><span class="status-badge status-' + statusBadgeClass + '">' + statusText + '</span></div>' +
                '<div class="progress-section">' +
                '<div class="progress-item"><div class="progress-label"><span>Meetings</span><span>' + m.meetings[currentPeriod] + '/' + TOTALS[currentPeriod].meetings + ' (' + pct + '%)</span></div>' +
                '<div class="progress-bar"><div class="progress-fill meetings" style="width:' + Math.min(pct, 100) + '%"></div></div></div>' +
                '<div class="progress-item"><div class="progress-label"><span>Projects</span><span>' + m.projects[currentPeriod] + '/' + TOTALS[currentPeriod].projects + ' (' + projPct + '%)</span></div>' +
                '<div class="progress-bar"><div class="progress-fill projects" style="width:' + Math.min(projPct, 100) + '%"></div></div></div>' +
                '</div></div>';
        }

        function renderGuests() {
            var grid = document.getElementById('guestGrid');
            if (guests.length === 0) { grid.innerHTML = '<div class="no-data">No guests found</div>'; return; }
            var html = '';
            for (var i = 0; i < guests.length; i++) html += renderGuestCard(guests[i]);
            grid.innerHTML = html;
        }

        function renderGuestCard(g) {
            var isEligible = g.meetings >= 3 && g.projects >= 2 && g.info && g.committee && g.ug;
            var committees = getCommittees(g.fullName);
            var committeeTags = '';
            if (committees.length > 0) {
                committeeTags = '<div class="committee-tags">';
                for (var i = 0; i < committees.length; i++) committeeTags += '<span class="committee-tag">' + committees[i] + '</span>';
                committeeTags += '</div>';
            }
            return '<div class="member-card guest-card"><div class="card-header"><div>' +
                '<div class="member-name">' + g.fullName + '</div><div class="member-tag">Guest</div>' + committeeTags +
                '</div><span class="status-badge" style="background:' + (isEligible ? '#9b59b6' : '#7f8c8d') + '">' + (isEligible ? 'Eligible!' : 'In Progress') + '</span></div>' +
                '<div class="progress-section">' +
                '<div class="progress-item"><div class="progress-label"><span>Meetings</span><span>' + g.meetings + '/' + TOTALS.h1.meetings + '</span></div>' +
                '<div class="progress-bar"><div class="progress-fill meetings" style="width:' + Math.min(g.meetPct, 100) + '%"></div></div></div>' +
                '<div class="progress-item"><div class="progress-label"><span>Projects</span><span>' + g.projects + '/' + TOTALS.h1.projects + '</span></div>' +
                '<div class="progress-bar"><div class="progress-fill projects" style="width:' + Math.min(g.projPct * 2, 100) + '%"></div></div></div></div>' +
                '<div class="checklist">' +
                '<div class="checklist-item ' + (g.meetings >= 3 ? 'completed' : 'pending') + '">' + (g.meetings >= 3 ? '&#10003;' : '&#10007;') + ' 3+ Meetings</div>' +
                '<div class="checklist-item ' + (g.projects >= 2 ? 'completed' : 'pending') + '">' + (g.projects >= 2 ? '&#10003;' : '&#10007;') + ' 2+ Projects</div>' +
                '<div class="checklist-item ' + (g.info ? 'completed' : 'pending') + '">' + (g.info ? '&#10003;' : '&#10007;') + ' Info Session</div>' +
                '<div class="checklist-item ' + (g.committee ? 'completed' : 'pending') + '">' + (g.committee ? '&#10003;' : '&#10007;') + ' Committee Mtg</div>' +
                '<div class="checklist-item ' + (g.ug ? 'completed' : 'pending') + '">' + (g.ug ? '&#10003;' : '&#10007;') + ' UG Student</div>' +
                '</div></div>';
        }

        function renderBirthdays() {
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var filtered = [];
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                if (!m.dateOfBirth || m.isTerminated) continue;
                var d = new Date(m.dateOfBirth);
                if (isNaN(d.getTime())) continue;
                if (currentBirthdayMonth === 'all' || (d.getMonth() + 1) === parseInt(currentBirthdayMonth)) filtered.push(m);
            }
            var container = document.getElementById('birthdayList');
            if (filtered.length === 0) { container.innerHTML = '<div class="no-data">No birthdays found</div>'; return; }
            var html = '';
            for (var i = 0; i < filtered.length; i++) {
                var m = filtered[i];
                var d = new Date(m.dateOfBirth);
                html += '<div class="celebration-card"><div class="celebration-icon">&#127874;</div><div class="celebration-info">' +
                    '<h4>' + m.fullName + '</h4><p>' + monthNames[d.getMonth() + 1] + ' ' + d.getDate() + ' - Turning ' + ((m.age || 0) + 1) + '</p></div></div>';
            }
            container.innerHTML = html;
        }

        function renderAnniversaries() {
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var filtered = [];
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                if (!m.dateInducted || m.isTerminated) continue;
                var d = new Date(m.dateInducted);
                if (isNaN(d.getTime())) continue;
                if (currentAnniversaryMonth === 'all' || (d.getMonth() + 1) === parseInt(currentAnniversaryMonth)) filtered.push(m);
            }
            var container = document.getElementById('anniversaryList');
            if (filtered.length === 0) { container.innerHTML = '<div class="no-data">No anniversaries found</div>'; return; }
            var html = '';
            for (var i = 0; i < filtered.length; i++) {
                var m = filtered[i];
                var d = new Date(m.dateInducted);
                var years = (m.yearsOfService || 0) + 1;
                html += '<div class="celebration-card"><div class="celebration-icon">&#127881;</div><div class="celebration-info">' +
                    '<h4>' + m.fullName + '</h4><p>' + monthNames[d.getMonth() + 1] + ' ' + d.getDate() + ' - ' + years + ' year' + (years !== 1 ? 's' : '') + '</p></div></div>';
            }
            container.innerHTML = html;
        }

        function renderSummary() {
            var tbody = document.getElementById('summaryBody');
            var html = '';
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                if (m.isTerminated) continue;
                var pct = Math.round((m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100);
                var comms = getCommittees(m.fullName).join(', ') || '-';
                var good = isGoodStanding(m);
                html += '<tr><td>' + m.fullName + '</td><td>' + comms + '</td><td>' + m.meetings[currentPeriod] + '/' + TOTALS[currentPeriod].meetings + '</td>' +
                    '<td>' + m.projects[currentPeriod] + '/' + TOTALS[currentPeriod].projects + '</td><td>' + pct + '%</td>' +
                    '<td style="color:' + (good ? '#27ae60' : '#e74c3c') + '">' + (good ? '&#10003; Good' : '&#10007; Check') + '</td></tr>';
            }
            tbody.innerHTML = html;
        }

        function showMemberDetails(idx) {
            var filtered = [];
            var statusF = document.getElementById('statusFilter').value;
            var commF = document.getElementById('committeeFilter').value;
            var search = document.getElementById('searchInput').value.toLowerCase();
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                if (search && m.fullName.toLowerCase().indexOf(search) === -1) continue;
                if (statusF === 'good' && !isGoodStanding(m)) continue;
                if (statusF === 'notgood' && (isGoodStanding(m) || m.isTerminated)) continue;
                if (statusF === 'terminated' && !m.isTerminated) continue;
                if (commF !== 'all') {
                    var comms = getCommittees(m.fullName);
                    var hasComm = false;
                    for (var j = 0; j < comms.length; j++) { if (comms[j] === commF) hasComm = true; }
                    if (!hasComm) continue;
                }
                filtered.push(m);
            }
            var m = filtered[idx];
            if (!m) return;
            currentMemberForExport = m;
            var committees = getCommittees(m.fullName);
            var pct = Math.round((m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100);
            var attendedHtml = '';
            if (m.meetingDetails[currentPeriod].length > 0) {
                for (var i = 0; i < m.meetingDetails[currentPeriod].length; i++) {
                    var md = m.meetingDetails[currentPeriod][i];
                    attendedHtml += '<div class="meeting-item"><span class="meeting-date">' + md.date + '</span><span class="meeting-type">' + md.type + '</span></div>';
                }
            } else {
                attendedHtml = '<div style="color:#95a5a6;padding:10px;">No meetings attended</div>';
            }
            
            var missedHtml = '';
            if (m.missedMeetings[currentPeriod] && m.missedMeetings[currentPeriod].length > 0) {
                for (var i = 0; i < m.missedMeetings[currentPeriod].length; i++) {
                    var mm = m.missedMeetings[currentPeriod][i];
                    missedHtml += '<div class="meeting-item" style="background:rgba(231,76,60,0.1);"><span class="meeting-date" style="color:#e74c3c;">' + mm.date + '</span><span class="meeting-type">' + mm.name + '</span></div>';
                }
            } else {
                missedHtml = '<div style="color:#27ae60;padding:10px;">No meetings missed - Great job!</div>';
            }
            
            document.getElementById('modalContent').innerHTML = '<div class="modal-header">' +
                '<div class="modal-name">' + m.fullName + '</div>' +
                '<div class="modal-email">' + (m.email || 'No email') + '</div>' +
                (m.contact ? '<div class="modal-contact">Tel: ' + m.contact + '</div>' : '') + '</div>' +
                '<div class="detail-section"><div class="detail-title">Personal Information</div><div class="detail-grid">' +
                '<div class="detail-card"><div class="detail-label">Birthday</div><div class="detail-value">' + formatDate(m.dateOfBirth) + (m.age ? ' (Age ' + m.age + ')' : '') + '</div></div>' +
                '<div class="detail-card"><div class="detail-label">Inducted</div><div class="detail-value">' + formatDate(m.dateInducted) + '</div></div>' +
                '<div class="detail-card"><div class="detail-label">Years in RCUG</div><div class="detail-value">' + (m.yearsOfService !== null ? m.yearsOfService : 'N/A') + '</div></div>' +
                '<div class="detail-card"><div class="detail-label">Category</div><div class="detail-value">' + m.category + '</div></div>' +
                '<div class="detail-card full-width"><div class="detail-label">Committees</div><div class="detail-value">' + (committees.length > 0 ? committees.join(', ') : 'None') + '</div></div>' +
                '</div></div>' +
                '<div class="detail-section"><div class="detail-title">Attendance - ' + currentPeriod.toUpperCase() + '</div><div class="detail-grid">' +
                '<div class="detail-card"><div class="detail-label">Meetings</div><div class="detail-value">' + m.meetings[currentPeriod] + '/' + TOTALS[currentPeriod].meetings + ' (' + pct + '%)</div></div>' +
                '<div class="detail-card"><div class="detail-label">Projects</div><div class="detail-value">' + m.projects[currentPeriod] + '/' + TOTALS[currentPeriod].projects + '</div></div>' +
                '</div></div>' +
                '<div class="detail-section"><div class="detail-title" style="color:#27ae60;">Meetings Attended (' + m.meetingDetails[currentPeriod].length + ')</div><div class="meeting-list">' + attendedHtml + '</div></div>' +
                '<div class="detail-section"><div class="detail-title" style="color:#e74c3c;">Meetings Missed (' + (m.missedMeetings[currentPeriod] ? m.missedMeetings[currentPeriod].length : 0) + ')</div><div class="meeting-list">' + missedHtml + '</div></div>';
            document.getElementById('memberModal').style.display = 'flex';
        }

        function closeModal() { document.getElementById('memberModal').style.display = 'none'; currentMemberForExport = null; }

        function exportCurrentMember() { if (currentMemberForExport) exportMemberByName(currentMemberForExport.fullName); }

        function exportMemberCard(idx) {
            var filtered = [];
            var statusF = document.getElementById('statusFilter').value;
            var commF = document.getElementById('committeeFilter').value;
            var search = document.getElementById('searchInput').value.toLowerCase();
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                if (search && m.fullName.toLowerCase().indexOf(search) === -1) continue;
                if (statusF === 'good' && !isGoodStanding(m)) continue;
                if (statusF === 'notgood' && (isGoodStanding(m) || m.isTerminated)) continue;
                if (statusF === 'terminated' && !m.isTerminated) continue;
                if (commF !== 'all') {
                    var comms = getCommittees(m.fullName);
                    var hasComm = false;
                    for (var j = 0; j < comms.length; j++) { if (comms[j] === commF) hasComm = true; }
                    if (!hasComm) continue;
                }
                filtered.push(m);
            }
            if (filtered[idx]) exportMemberByName(filtered[idx].fullName);
        }

        function exportMemberByName(name) {
            var m = null;
            for (var i = 0; i < members.length; i++) { if (members[i].fullName === name) { m = members[i]; break; } }
            if (!m) return;
            var pct = Math.round((m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100);
            var committees = getCommittees(m.fullName);
            var attendedList = '';
            if (m.meetingDetails[currentPeriod].length > 0) {
                for (var i = 0; i < m.meetingDetails[currentPeriod].length; i++) {
                    var md = m.meetingDetails[currentPeriod][i];
                    attendedList += '<li>' + md.date + ' - ' + md.type + '</li>';
                }
            } else { attendedList = '<li>None</li>'; }
            
            var missedList = '';
            if (m.missedMeetings[currentPeriod] && m.missedMeetings[currentPeriod].length > 0) {
                for (var i = 0; i < m.missedMeetings[currentPeriod].length; i++) {
                    var mm = m.missedMeetings[currentPeriod][i];
                    missedList += '<li style="color:red;">' + mm.date + ' - ' + mm.name + '</li>';
                }
            } else { missedList = '<li style="color:green;">None - Great attendance!</li>'; }
            
            var printDiv = document.createElement('div');
            printDiv.style.cssText = 'position:fixed;left:-9999px;width:800px;padding:40px;background:white;color:black;font-family:Arial,sans-serif;';
            printDiv.innerHTML = '<div style="text-align:center;margin-bottom:30px;"><h1 style="color:#e91e63;margin:0;">Rotaract Club of University of Guyana</h1>' +
                '<h2 style="color:#666;margin:10px 0;">Member Attendance Report</h2><p style="color:#999;">Period: ' + currentPeriod.toUpperCase() + '</p></div>' +
                '<div style="border:2px solid #e91e63;border-radius:10px;padding:20px;"><h2 style="margin-top:0;color:#333;">' + m.fullName + '</h2>' +
                '<p><strong>Email:</strong> ' + (m.email || 'N/A') + '</p><p><strong>Contact:</strong> ' + (m.contact || 'N/A') + '</p>' +
                '<p><strong>Category:</strong> ' + m.category + '</p><p><strong>Committees:</strong> ' + (committees.length > 0 ? committees.join(', ') : 'None') + '</p>' +
                '<hr style="margin:15px 0;"><h3 style="color:#333;">Attendance Summary</h3>' +
                '<p><strong>Meetings:</strong> ' + m.meetings[currentPeriod] + '/' + TOTALS[currentPeriod].meetings + ' (' + pct + '%)</p>' +
                '<p><strong>Projects:</strong> ' + m.projects[currentPeriod] + '/' + TOTALS[currentPeriod].projects + '</p>' +
                '<p><strong>Status:</strong> <span style="color:' + (pct >= 60 ? 'green' : 'red') + ';">' + (pct >= 60 ? 'Good Standing' : 'Needs Attention') + '</span></p>' +
                '<hr style="margin:15px 0;"><h3 style="color:green;">Meetings Attended (' + m.meetingDetails[currentPeriod].length + ')</h3><ul>' + attendedList + '</ul>' +
                '<h3 style="color:red;">Meetings Missed (' + (m.missedMeetings[currentPeriod] ? m.missedMeetings[currentPeriod].length : 0) + ')</h3><ul>' + missedList + '</ul></div>' +
                '<div style="text-align:center;margin-top:20px;color:#666;font-size:12px;">Generated: ' + new Date().toLocaleString() + '</div>';
            document.body.appendChild(printDiv);
            html2canvas(printDiv, { scale: 2, backgroundColor: '#ffffff' }).then(function(canvas) {
                var imgData = canvas.toDataURL('image/png');
                var jsPDF = window.jspdf.jsPDF;
                var pdf = new jsPDF('p', 'mm', 'a4');
                var imgWidth = 210;
                var imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save(m.fullName.replace(/\\s+/g, '_') + '_Report.pdf');
                document.body.removeChild(printDiv);
            }).catch(function() { document.body.removeChild(printDiv); alert('Error generating PDF'); });
        }

        function exportBirthdays() {
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var data = [];
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                if (!m.dateOfBirth || m.isTerminated) continue;
                var d = new Date(m.dateOfBirth);
                if (isNaN(d.getTime())) continue;
                if (currentBirthdayMonth === 'all' || (d.getMonth() + 1) === parseInt(currentBirthdayMonth)) data.push(m);
            }
            if (data.length === 0) { alert('No birthdays to export'); return; }
            var csv = 'Name,Month,Day,Turning Age\\n';
            for (var i = 0; i < data.length; i++) {
                var m = data[i];
                var d = new Date(m.dateOfBirth);
                csv += '"' + m.fullName + '",' + monthNames[d.getMonth() + 1] + ',' + d.getDate() + ',' + ((m.age || 0) + 1) + '\\n';
            }
            downloadCSV(csv, 'RCUG_Birthdays.csv');
        }

        function exportAnniversaries() {
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var data = [];
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                if (!m.dateInducted || m.isTerminated) continue;
                var d = new Date(m.dateInducted);
                if (isNaN(d.getTime())) continue;
                if (currentAnniversaryMonth === 'all' || (d.getMonth() + 1) === parseInt(currentAnniversaryMonth)) data.push(m);
            }
            if (data.length === 0) { alert('No anniversaries to export'); return; }
            var csv = 'Name,Month,Day,Years\\n';
            for (var i = 0; i < data.length; i++) {
                var m = data[i];
                var d = new Date(m.dateInducted);
                csv += '"' + m.fullName + '",' + monthNames[d.getMonth() + 1] + ',' + d.getDate() + ',' + ((m.yearsOfService || 0) + 1) + '\\n';
            }
            downloadCSV(csv, 'RCUG_Anniversaries.csv');
        }

        function exportSummary() {
            var csv = 'Name,Committees,Meetings,Projects,Percentage,Status\\n';
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                if (m.isTerminated) continue;
                var pct = Math.round((m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100);
                var comms = getCommittees(m.fullName).join('; ') || '-';
                csv += '"' + m.fullName + '","' + comms + '",' + m.meetings[currentPeriod] + '/' + TOTALS[currentPeriod].meetings + ',' +
                    m.projects[currentPeriod] + '/' + TOTALS[currentPeriod].projects + ',' + pct + '%,' + (pct >= 60 ? 'Good Standing' : 'Needs Attention') + '\\n';
            }
            downloadCSV(csv, 'RCUG_Summary.csv');
        }

        function downloadCSV(csv, filename) {
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

        loadAllData();
    <\/script>
</body>
</html>`;
