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
        
        /* Header */
        header { text-align: center; padding: 20px; margin-bottom: 30px; background: rgba(255,255,255,0.1); border-radius: 15px; backdrop-filter: blur(10px); }
        h1 { font-size: 2.5rem; background: linear-gradient(90deg, #f39c12, #e74c3c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 10px; }
        .subtitle { color: #bdc3c7; font-size: 1.1rem; }
        
        /* Loading/Error States */
        .loading { text-align: center; padding: 60px; font-size: 1.2rem; color: #f1c40f; }
        .error { text-align: center; padding: 40px; color: #e74c3c; background: rgba(231,76,60,0.1); border-radius: 10px; margin: 20px 0; }
        
        /* Controls */
        .controls { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-bottom: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; }
        .control-group { display: flex; flex-direction: column; gap: 5px; }
        .control-group label { font-size: 0.85rem; color: #bdc3c7; text-transform: uppercase; letter-spacing: 1px; }
        select, input[type="text"] { padding: 10px 15px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: #fff; font-size: 1rem; cursor: pointer; min-width: 180px; }
        select:focus, input:focus { outline: 2px solid #f39c12; }
        select option { background: #1a1a2e; color: #fff; }
        .refresh-btn { padding: 10px 20px; border: none; border-radius: 8px; background: #3498db; color: #fff; font-size: 1rem; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .refresh-btn:hover { background: #2980b9; transform: scale(1.02); }
        
        /* Stats Bar */
        .stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center; backdrop-filter: blur(5px); }
        .stat-card h3 { font-size: 2rem; color: #f39c12; }
        .stat-card p { color: #bdc3c7; font-size: 0.9rem; margin-top: 5px; }
        
        /* Tabs */
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab-btn { padding: 12px 24px; border: none; border-radius: 10px; background: rgba(255,255,255,0.1); color: #fff; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .tab-btn.active { background: linear-gradient(90deg, #f39c12, #e74c3c); }
        .tab-btn:hover:not(.active) { background: rgba(255,255,255,0.2); }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        
        /* Section Title */
        .section-title { font-size: 1.5rem; margin: 20px 0; padding-bottom: 10px; border-bottom: 2px solid #f39c12; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .export-btn { background: linear-gradient(90deg, #27ae60, #2ecc71); border: none; padding: 10px 20px; border-radius: 8px; color: #fff; font-size: 0.9rem; cursor: pointer; font-weight: 600; transition: transform 0.2s; }
        .export-btn:hover { transform: scale(1.05); }
        
        /* Member Grid */
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; margin-bottom: 40px; }
        
        /* Member Card */
        .member-card { background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); border-radius: 15px; padding: 20px; position: relative; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; cursor: pointer; border-left: 4px solid #27ae60; }
        .member-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .member-card.good-standing { border-left-color: #27ae60; }
        .member-card.not-good-standing { border-left-color: #e74c3c; }
        .member-card.guest-card { border-left-color: #3498db; }
        .member-card.terminated { border-left-color: #7f8c8d; opacity: 0.7; }
        
        /* Card Header */
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
        .member-name { font-size: 1.2rem; font-weight: 600; padding-right: 10px; }
        .member-tag { font-size: 0.8rem; color: #bdc3c7; margin-top: 3px; }
        
        /* Badges */
        .badges { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
        .badge { font-size: 0.65rem; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; font-weight: 600; }
        .badge-new { background: linear-gradient(90deg, #9b59b6, #8e44ad); animation: pulse 2s infinite; }
        .badge-board { background: #f39c12; color: #000; }
        .badge-years { background: #1abc9c; }
        .badge-terminated { background: #7f8c8d; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        
        /* Status Badge */
        .status-badge { padding: 4px 12px; border-radius: 15px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
        .status-good { background: #27ae60; }
        .status-notgood { background: #e74c3c; }
        .status-terminated { background: #7f8c8d; }
        
        /* Committee Tags */
        .committee-tags { margin-top: 8px; }
        .committee-tag { display: inline-block; background: rgba(243, 156, 18, 0.3); padding: 2px 8px; border-radius: 4px; margin: 2px 2px 2px 0; font-size: 0.7rem; color: #f39c12; }
        
        /* Card Actions */
        .card-actions { position: absolute; top: 10px; right: 10px; }
        .card-action-btn { background: rgba(255,255,255,0.2); border: none; border-radius: 5px; padding: 5px 10px; color: #fff; cursor: pointer; font-size: 0.7rem; transition: all 0.3s; }
        .card-action-btn:hover { background: rgba(255,255,255,0.4); }
        
        /* Progress Bars */
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
        
        /* Guest Checklist */
        .checklist { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); }
        .checklist-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
        .checklist-item.completed { color: #27ae60; }
        .checklist-item.pending { color: #e74c3c; }
        
        /* Filter Pills */
        .filter-pills { display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0; }
        .filter-pill { padding: 8px 16px; border-radius: 20px; background: rgba(255,255,255,0.1); font-size: 0.85rem; cursor: pointer; transition: all 0.3s; border: none; color: #fff; }
        .filter-pill:hover, .filter-pill.active { background: #f39c12; }
        
        /* Celebration Cards */
        .celebration-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 15px; }
        .celebration-card { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 15px; }
        .celebration-icon { font-size: 2.5rem; }
        .celebration-info h4 { font-size: 1rem; margin-bottom: 3px; }
        .celebration-info p { font-size: 0.85rem; color: #bdc3c7; }
        
        /* Summary Table */
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
        .summary-table th, .summary-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .summary-table th { background: rgba(243, 156, 18, 0.2); font-weight: 600; text-transform: uppercase; font-size: 0.8rem; }
        .summary-table tr:hover { background: rgba(255,255,255,0.05); }
        
        /* Modal */
        .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
        .modal-content { background: linear-gradient(135deg, #2c3e50, #1a1a2e); border-radius: 20px; padding: 30px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; }
        .close-btn { position: absolute; top: 15px; right: 20px; font-size: 2rem; cursor: pointer; color: #bdc3c7; background: none; border: none; }
        .close-btn:hover { color: #e74c3c; }
        .modal-header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .modal-name { font-size: 1.8rem; margin-bottom: 5px; }
        .modal-email { color: #bdc3c7; font-size: 0.9rem; }
        .modal-contact { color: #3498db; font-size: 0.9rem; margin-top: 5px; }
        
        /* Detail Section */
        .detail-section { margin-bottom: 25px; }
        .detail-title { font-size: 1.1rem; font-weight: 600; color: #f1c40f; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid rgba(241,196,15,0.3); }
        .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .detail-card { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 15px; }
        .detail-card.full-width { grid-column: 1 / -1; }
        .detail-label { font-size: 0.75rem; color: #95a5a6; margin-bottom: 5px; text-transform: uppercase; }
        .detail-value { font-size: 0.95rem; color: #ecf0f1; }
        
        /* Meeting List in Modal */
        .meeting-list { max-height: 200px; overflow-y: auto; }
        .meeting-item { padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 5px; margin-bottom: 5px; font-size: 0.85rem; display: flex; justify-content: space-between; }
        .meeting-date { color: #3498db; font-weight: 600; }
        .meeting-type { color: #bdc3c7; }
        .meeting-missed { background: rgba(231,76,60,0.1); }
        .meeting-missed .meeting-date { color: #e74c3c; }
        
        /* No Data Message */
        .no-data { text-align: center; padding: 40px; color: #7f8c8d; font-size: 1.1rem; }
        
        /* Responsive */
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
                        <option value="q3">Q3 (Jan-Mar)</option>
                        <option value="q4">Q4 (Apr-Jun)</option>
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
                <div class="stat-card"><h3 id="newMembers">0</h3><p>New Members (6mo)</p></div>
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
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Committee(s)</th>
                            <th>Meetings</th>
                            <th>Projects</th>
                            <th>Overall %</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="summaryBody"></tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Member Detail Modal -->
    <div id="memberModal" class="modal" onclick="closeModal(event)">
        <div class="modal-content" onclick="event.stopPropagation()">
            <button class="close-btn" onclick="closeModal()">&times;</button>
            <div id="modalContent"></div>
            <div style="text-align: center; margin-top: 20px;">
                <button class="export-btn" id="exportMemberBtn" onclick="exportCurrentMember()">Export to PDF</button>
            </div>
        </div>
    </div>

    <script>
        // ============================================
        // CONFIGURATION
        // ============================================
        const SHEET_ID = '1j0uOvYCe-DvOsPjxyb7RfLm7ddeB_LL99cJKeO40RaM';
        const GUEST_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv&gid=1284804990';
        const MEMBER_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv&gid=1821690489';
        const BOARD_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv&gid=419776584';
        const ATTENDANCE_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv&gid=1315129184';

        const TOTALS = {
            q1: { meetings: 6, projects: 5 },
            q2: { meetings: 5, projects: 5 },
            q3: { meetings: 5, projects: 5 },
            q4: { meetings: 5, projects: 5 },
            h1: { meetings: 11, projects: 10 },
            h2: { meetings: 10, projects: 10 }
        };

        const BOARD_MEMBERS = ['Adanna Edwards', 'Andrew Hing', 'Christine Samuels', 'Darin Hall', 'Ganesh Anand', 'Jemima Stephenson', 'Kadeem Bowen', 'Nandita Singh', 'Omari London', 'Ruth Manbodh', 'Vishal Roopnarine', 'Yushina Ramlall'];

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

        // Title rows to exclude from member list
        const EXCLUDED_NAMES = [
            'MEMBER REGISTRY', 'Full Name', 'Training', 'Assistant Secretary',
            'Rotary Foundation Chair', 'Membership Chair', 'Hobbies', 'Playing Games',
            'Jogging', 'Going for long Drives', 'The Performing Arts', 'Athletics'
        ];

        // ============================================
        // GLOBAL STATE
        // ============================================
        let members = [];
        let guests = [];
        let allAttendance = [];
        let boardAttendance = {};
        let currentPeriod = 'q2';
        let currentBirthdayMonth = 'all';
        let currentAnniversaryMonth = 'all';
        let currentMemberForExport = null;

        // ============================================
        // UTILITY FUNCTIONS
        // ============================================
        function getCommittees(name) {
            return COMMITTEE_ASSIGNMENTS[name] || [];
        }

        function isExcludedName(name) {
            if (!name) return true;
            const nameLower = name.toLowerCase();
            return EXCLUDED_NAMES.some(exc => nameLower.includes(exc.toLowerCase()));
        }

        function formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            const d = new Date(dateStr);
            if (isNaN(d)) return 'N/A';
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
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

        function getYearsOfService(dateStr) {
            if (!dateStr) return null;
            const inducted = new Date(dateStr);
            if (isNaN(inducted)) return null;
            const today = new Date();
            let years = today.getFullYear() - inducted.getFullYear();
            const m = today.getMonth() - inducted.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < inducted.getDate())) years--;
            return Math.max(0, years);
        }

        function isNewMember(dateStr) {
            if (!dateStr) return false;
            const inducted = new Date(dateStr);
            if (isNaN(inducted)) return false;
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return inducted > sixMonthsAgo;
        }

        function getProgressClass(pct) {
            if (pct >= 60) return 'good';
            if (pct >= 40) return 'warning';
            return 'danger';
        }

        function isGoodStanding(m) {
            if (m.isTerminated) return false;
            const pct = (m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100;
            return pct >= 60;
        }

        // ============================================
        // DATA LOADING
        // ============================================
        async function fetchCSV(url, name) {
            const response = await fetch(url);
            if (!response.ok) throw new Error(name + ': HTTP ' + response.status);
            const text = await response.text();
            return new Promise(function(resolve) {
                Papa.parse(text, {
                    header: false,
                    skipEmptyLines: true,
                    complete: function(r) { resolve(r.data); }
                });
            });
        }

        async function loadAllData() {
            document.getElementById('loadingMessage').style.display = 'block';
            document.getElementById('mainContent').style.display = 'none';
            document.getElementById('errorMessage').style.display = 'none';

            try {
                const results = await Promise.all([
                    fetchCSV(GUEST_URL, 'Guests').catch(function(e) { console.error(e); return []; }),
                    fetchCSV(MEMBER_URL, 'Members').catch(function(e) { console.error(e); return []; }),
                    fetchCSV(BOARD_URL, 'Board').catch(function(e) { console.error(e); return []; }),
                    fetchCSV(ATTENDANCE_URL, 'Attendance').catch(function(e) { console.error(e); return []; })
                ]);

                const guestData = results[0];
                const memberData = results[1];
                const boardData = results[2];
                const attData = results[3];

                if (memberData.length === 0) throw new Error('Could not load member data. Check sheet sharing settings.');

                processAttendance(attData);
                processBoard(boardData);
                processGuests(guestData);
                processMembers(memberData);
                calculateMemberStats();

                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                document.getElementById('lastUpdated').textContent = new Date().toLocaleString();

                setupEventListeners();
                renderAll();

            } catch (error) {
                console.error('Load error:', error);
                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('errorMessage').style.display = 'block';
                document.getElementById('errorMessage').innerHTML = '<h3>Error Loading Data</h3><p>' + error.message + '</p><p style="margin-top:15px;">Make sure your Google Sheet is shared with "Anyone with the link can view"</p>';
            }
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

                var dateStr = r[6];
                var meetingType = r[7] || '';
                var quarter = r[9] || '';

                allAttendance.push({
                    name: r[0].toString().trim(),
                    type: meetingType.toString().trim(),
                    quarter: quarter.toString().trim(),
                    dateStr: dateStr,
                    dateFormatted: formatDate(dateStr)
                });
            }
        }

        function processBoard(data) {
            boardAttendance = {};
            if (!data.length) return;

            var currentQuarter = 0;
            for (var i = 0; i < data.length; i++) {
                var r = data[i];
                if (r[0] && r[0].toString().includes('QUARTER BOARD MEETING')) {
                    currentQuarter++;
                    continue;
                }
                if (r[0] === 'First Name' || !r[0] || r[0] === 'Total') continue;

                var name = ((r[0] || '') + ' ' + (r[1] || '')).trim();
                if (!name || name === ' ') continue;

                if (!boardAttendance[name]) {
                    boardAttendance[name] = { total: 0, q1: 0, q2: 0, q3: 0, q4: 0 };
                }

                var qTotal = 0;
                for (var j = 2; j <= 4; j++) {
                    if (r[j] == 1 || r[j] === '1') qTotal++;
                }

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

            var hdr = -1;
            for (var i = 0; i < Math.min(10, data.length); i++) {
                if (data[i][0] === 'First Name') { hdr = i; break; }
            }

            var map = new Map();
            for (var i = (hdr >= 0 ? hdr : 2) + 1; i < data.length; i++) {
                var r = data[i];
                if (!r[0] || r[0] === 'First Name' || r[0] === 'NaN') continue;

                var name = ((r[0] || '') + ' ' + (r[1] || '')).trim();
                if (!name || name === 'NaN NaN' || isExcludedName(name)) continue;

                // Skip if already a member
                if (members.some(function(m) { return m.fullName === name; })) continue;

                var g = map.get(name);
                if (!g) {
                    g = {
                        fullName: name,
                        firstName: r[0] || '',
                        lastName: r[1] || '',
                        status: '',
                        meetings: 0,
                        projects: 0,
                        info: false,
                        committee: false,
                        ug: false
                    };
                    map.set(name, g);
                }

                // Count meetings (columns 3-8)
                for (var j = 3; j <= 8; j++) {
                    if (r[j] == 1 || r[j] === 'TRUE' || r[j] === '1') g.meetings++;
                }
                // Count projects (columns 12-22)
                for (var j = 12; j <= 22; j++) {
                    if (r[j] == 1 || r[j] === 'TRUE' || r[j] === '1') g.projects++;
                }

                if (r[24] === 'TRUE' || r[24] == 1) g.info = true;
                if (r[25] === 'TRUE' || r[25] == 1) g.committee = true;
                if (r[26] === 'TRUE' || r[26] == 1) g.ug = true;
                if (r[2]) g.status = r[2];
            }

            map.forEach(function(g) {
                g.meetings = Math.min(g.meetings, TOTALS.h1.meetings);
                g.projects = Math.min(g.projects, TOTALS.h1.projects);
                g.meetPct = (g.meetings / TOTALS.h1.meetings) * 100;
                g.projPct = (g.projects / TOTALS.h1.projects) * 100;
                guests.push(g);
            });
        }

        function processMembers(data) {
            members = [];
            if (!data.length) return;

            var hdr = -1;
            for (var i = 0; i < Math.min(10, data.length); i++) {
                if (data[i][0] === 'ID' || (data[i][1] && data[i][1].toString().includes('Full Name'))) {
                    hdr = i;
                    break;
                }
            }

            if (hdr === -1) hdr = 0;

            for (var i = hdr + 1; i < data.length; i++) {
                var r = data[i];
                var name = (r[1] || '').toString().trim();

                // Skip empty, header rows, and excluded names
                if (!name || name === 'Full Name' || name === '' || isExcludedName(name)) continue;

                var registryStatus = (r[10] || '').toString().trim();
                var isTerminated = registryStatus.toLowerCase().includes('terminated');
                var isBoardMember = BOARD_MEMBERS.includes(name);

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
                    ugStatus: (r[9] || '').toString().trim(),
                    education: (r[11] || '').toString().trim(),
                    profession: (r[12] || '').toString().trim(),
                    isNewMember: isNewMember(r[7]),
                    isBoardMember: isBoardMember,
                    isTerminated: isTerminated,
                    meetings: { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0 },
                    projects: { q1: 0, q2: 0, q3: 0, q4: 0, h1: 0, h2: 0 },
                    meetingDetails: { q1: [], q2: [], q3: [], q4: [], h1: [], h2: [] },
                    missedMeetings: { q1: [], q2: [], q3: [], q4: [], h1: [], h2: [] },
                    boardMeetings: isBoardMember && boardAttendance[name] ? boardAttendance[name] : null
                });
            }
        }

        function calculateMemberStats() {
            members.forEach(function(m) {
                ['q1', 'q2', 'q3', 'q4', 'h1', 'h2'].forEach(function(p) {
                    var att = allAttendance.filter(function(a) {
                        if (a.name !== m.fullName) return false;
                        if (p === 'h1') return a.quarter === 'Q1' || a.quarter === 'Q2';
                        if (p === 'h2') return a.quarter === 'Q3' || a.quarter === 'Q4';
                        return a.quarter === p.toUpperCase();
                    });

                    m.meetings[p] = att.filter(function(a) {
                        return a.type === 'Business Meeting' || a.type === 'Fellowship Meeting';
                    }).length;

                    m.projects[p] = att.filter(function(a) {
                        return a.type === 'Project';
                    }).length;

                    m.meetingDetails[p] = att.map(function(a) {
                        return { date: a.dateFormatted, type: a.type };
                    });
                });
            });
        }

        // ============================================
        // EVENT LISTENERS
        // ============================================
        function setupEventListeners() {
            document.getElementById('periodSelect').addEventListener('change', function(e) {
                currentPeriod = e.target.value;
                renderAll();
            });

            document.getElementById('statusFilter').addEventListener('change', renderMembers);
            document.getElementById('committeeFilter').addEventListener('change', renderMembers);
            document.getElementById('searchInput').addEventListener('input', renderMembers);

            // Tab buttons
            document.querySelectorAll('.tab-btn').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
                    document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
                    e.target.classList.add('active');
                    document.getElementById(e.target.dataset.tab + '-tab').classList.add('active');
                });
            });

            // Build month filter pills
            buildMonthFilters();
        }

        function buildMonthFilters() {
            var months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            var bdayHtml = '';
            var annivHtml = '';
            months.forEach(function(m, i) {
                var val = i === 0 ? 'all' : i;
                var activeClass = i === 0 ? ' active' : '';
                bdayHtml += '<button class="filter-pill' + activeClass + '" data-month="' + val + '">' + m + '</button>';
                annivHtml += '<button class="filter-pill' + activeClass + '" data-month="' + val + '">' + m + '</button>';
            });

            document.getElementById('birthdayMonthFilter').innerHTML = bdayHtml;
            document.getElementById('anniversaryMonthFilter').innerHTML = annivHtml;

            document.querySelectorAll('#birthdayMonthFilter .filter-pill').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    document.querySelectorAll('#birthdayMonthFilter .filter-pill').forEach(function(b) { b.classList.remove('active'); });
                    e.target.classList.add('active');
                    currentBirthdayMonth = e.target.dataset.month;
                    renderBirthdays();
                });
            });

            document.querySelectorAll('#anniversaryMonthFilter .filter-pill').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    document.querySelectorAll('#anniversaryMonthFilter .filter-pill').forEach(function(b) { b.classList.remove('active'); });
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
            renderSummary();
        }

        function updateStats() {
            var active = members.filter(function(m) { return !m.isTerminated; });
            var good = active.filter(function(m) { return isGoodStanding(m); }).length;
            var newM = active.filter(function(m) { return m.isNewMember; }).length;

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

            var filtered = members.filter(function(m) {
                if (search && m.fullName.toLowerCase().indexOf(search) === -1) return false;
                if (statusF === 'good' && !isGoodStanding(m)) return false;
                if (statusF === 'notgood' && (isGoodStanding(m) || m.isTerminated)) return false;
                if (statusF === 'terminated' && !m.isTerminated) return false;
                if (commF !== 'all') {
                    var comms = getCommittees(m.fullName);
                    if (comms.indexOf(commF) === -1) return false;
                }
                return true;
            });

            var grid = document.getElementById('memberGrid');

            if (filtered.length === 0) {
                grid.innerHTML = '<div class="no-data">No members match the current filters</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(m) {
                html += renderMemberCard(m);
            });
            grid.innerHTML = html;
        }

        function renderMemberCard(m) {
            var pct = (m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100;
            var projPct = (m.projects[currentPeriod] / TOTALS[currentPeriod].projects) * 100;
            var committees = getCommittees(m.fullName);

            var statusClass = 'good-standing';
            var statusText = 'Good Standing';
            if (m.isTerminated) {
                statusClass = 'terminated';
                statusText = 'Terminated';
            } else if (pct < 60) {
                statusClass = 'not-good-standing';
                statusText = 'Needs Attention';
            }

            var badges = '';
            if (m.isNewMember) badges += '<span class="badge badge-new">NEW</span>';
            if (m.isBoardMember) badges += '<span class="badge badge-board">BOARD</span>';
            if (m.yearsOfService !== null && m.yearsOfService >= 0) {
                badges += '<span class="badge badge-years">' + m.yearsOfService + 'yr' + (m.yearsOfService !== 1 ? 's' : '') + '</span>';
            }
            if (m.isTerminated) badges += '<span class="badge badge-terminated">TERMINATED</span>';

            var committeeTags = '';
            if (committees.length > 0) {
                committeeTags = '<div class="committee-tags">';
                committees.forEach(function(c) {
                    committeeTags += '<span class="committee-tag">' + c + '</span>';
                });
                committeeTags += '</div>';
            }

            var safeName = m.fullName.replace(/'/g, "\\'");

            return '<div class="member-card ' + statusClass + '" onclick="showMemberDetails(\'' + safeName + '\')">' +
                '<div class="card-actions">' +
                    '<button class="card-action-btn" onclick="event.stopPropagation(); exportMemberCard(\'' + safeName + '\')">Export</button>' +
                '</div>' +
                '<div class="card-header">' +
                    '<div>' +
                        '<div class="member-name">' + m.fullName + '</div>' +
                        '<div class="member-tag">' + m.category + '</div>' +
                        '<div class="badges">' + badges + '</div>' +
                        committeeTags +
                    '</div>' +
                    '<span class="status-badge status-' + statusClass.replace('good-standing', 'good').replace('not-good-standing', 'notgood') + '">' + statusText + '</span>' +
                '</div>' +
                '<div class="progress-section">' +
                    '<div class="progress-item">' +
                        '<div class="progress-label"><span>Meetings</span><span>' + m.meetings[currentPeriod] + '/' + TOTALS[currentPeriod].meetings + ' (' + Math.round(pct) + '%)</span></div>' +
                        '<div class="progress-bar"><div class="progress-fill meetings" style="width:' + Math.min(pct, 100) + '%"></div></div>' +
                    '</div>' +
                    '<div class="progress-item">' +
                        '<div class="progress-label"><span>Projects</span><span>' + m.projects[currentPeriod] + '/' + TOTALS[currentPeriod].projects + ' (' + Math.round(projPct) + '%)</span></div>' +
                        '<div class="progress-bar"><div class="progress-fill projects" style="width:' + Math.min(projPct, 100) + '%"></div></div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }

        function renderGuests() {
            var grid = document.getElementById('guestGrid');

            if (guests.length === 0) {
                grid.innerHTML = '<div class="no-data">No guests found</div>';
                return;
            }

            var html = '';
            guests.forEach(function(g) {
                html += renderGuestCard(g);
            });
            grid.innerHTML = html;
        }

        function renderGuestCard(g) {
            var isEligible = g.meetings >= 3 && g.projects >= 2 && g.info && g.committee && g.ug;
            var committees = getCommittees(g.fullName);

            var committeeTags = '';
            if (committees.length > 0) {
                committeeTags = '<div class="committee-tags">';
                committees.forEach(function(c) {
                    committeeTags += '<span class="committee-tag">' + c + '</span>';
                });
                committeeTags += '</div>';
            }

            return '<div class="member-card guest-card">' +
                '<div class="card-header">' +
                    '<div>' +
                        '<div class="member-name">' + g.fullName + '</div>' +
                        '<div class="member-tag">Guest</div>' +
                        committeeTags +
                    '</div>' +
                    '<span class="status-badge" style="background:' + (isEligible ? '#9b59b6' : '#7f8c8d') + '">' + (isEligible ? 'Eligible!' : 'In Progress') + '</span>' +
                '</div>' +
                '<div class="progress-section">' +
                    '<div class="progress-item">' +
                        '<div class="progress-label"><span>Meetings (60% req)</span><span>' + g.meetings + '/' + TOTALS.h1.meetings + ' (' + Math.round(g.meetPct) + '%)</span></div>' +
                        '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(g.meetPct) + '" style="width:' + Math.min(g.meetPct, 100) + '%"></div></div>' +
                    '</div>' +
                    '<div class="progress-item">' +
                        '<div class="progress-label"><span>Projects (50% req)</span><span>' + g.projects + '/' + TOTALS.h1.projects + ' (' + Math.round(g.projPct) + '%)</span></div>' +
                        '<div class="progress-bar"><div class="progress-fill ' + getProgressClass(g.projPct * 1.2) + '" style="width:' + Math.min(g.projPct * 2, 100) + '%"></div></div>' +
                    '</div>' +
                '</div>' +
                '<div class="checklist">' +
                    '<div class="checklist-item ' + (g.meetings >= 3 ? 'completed' : 'pending') + '">' + (g.meetings >= 3 ? '&#10003;' : '&#10007;') + ' 3+ Meetings</div>' +
                    '<div class="checklist-item ' + (g.projects >= 2 ? 'completed' : 'pending') + '">' + (g.projects >= 2 ? '&#10003;' : '&#10007;') + ' 2+ Projects</div>' +
                    '<div class="checklist-item ' + (g.info ? 'completed' : 'pending') + '">' + (g.info ? '&#10003;' : '&#10007;') + ' Info Session</div>' +
                    '<div class="checklist-item ' + (g.committee ? 'completed' : 'pending') + '">' + (g.committee ? '&#10003;' : '&#10007;') + ' Committee Mtg</div>' +
                    '<div class="checklist-item ' + (g.ug ? 'completed' : 'pending') + '">' + (g.ug ? '&#10003;' : '&#10007;') + ' UG Student</div>' +
                '</div>' +
            '</div>';
        }

        function renderBirthdays() {
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var filtered = members.filter(function(m) {
                if (!m.dateOfBirth || m.isTerminated) return false;
                var d = new Date(m.dateOfBirth);
                if (isNaN(d)) return false;
                if (currentBirthdayMonth === 'all') return true;
                return (d.getMonth() + 1) === parseInt(currentBirthdayMonth);
            }).sort(function(a, b) {
                var da = new Date(a.dateOfBirth);
                var db = new Date(b.dateOfBirth);
                return (da.getMonth() - db.getMonth()) || (da.getDate() - db.getDate());
            });

            var container = document.getElementById('birthdayList');
            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No birthdays found for this period</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(m) {
                var d = new Date(m.dateOfBirth);
                var nextAge = (m.age || 0) + 1;
                html += '<div class="celebration-card">' +
                    '<div class="celebration-icon">&#127874;</div>' +
                    '<div class="celebration-info">' +
                        '<h4>' + m.fullName + '</h4>' +
                        '<p>' + monthNames[d.getMonth() + 1] + ' ' + d.getDate() + ' &bull; Turning ' + nextAge + '</p>' +
                    '</div>' +
                '</div>';
            });
            container.innerHTML = html;
        }

        function renderAnniversaries() {
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var filtered = members.filter(function(m) {
                if (!m.dateInducted || m.isTerminated) return false;
                var d = new Date(m.dateInducted);
                if (isNaN(d)) return false;
                if (currentAnniversaryMonth === 'all') return true;
                return (d.getMonth() + 1) === parseInt(currentAnniversaryMonth);
            }).sort(function(a, b) {
                var da = new Date(a.dateInducted);
                var db = new Date(b.dateInducted);
                return (da.getMonth() - db.getMonth()) || (da.getDate() - db.getDate());
            });

            var container = document.getElementById('anniversaryList');
            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-data">No anniversaries found for this period</div>';
                return;
            }

            var html = '';
            filtered.forEach(function(m) {
                var d = new Date(m.dateInducted);
                var years = (m.yearsOfService || 0) + 1;
                html += '<div class="celebration-card">' +
                    '<div class="celebration-icon">&#127881;</div>' +
                    '<div class="celebration-info">' +
                        '<h4>' + m.fullName + '</h4>' +
                        '<p>' + monthNames[d.getMonth() + 1] + ' ' + d.getDate() + ' &bull; ' + years + ' year' + (years !== 1 ? 's' : '') + ' in RCUG</p>' +
                    '</div>' +
                '</div>';
            });
            container.innerHTML = html;
        }

        function renderSummary() {
            var tbody = document.getElementById('summaryBody');
            var active = members.filter(function(m) { return !m.isTerminated; });

            var html = '';
            active.forEach(function(m) {
                var pct = Math.round((m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100);
                var comms = getCommittees(m.fullName).join(', ') || '-';
                var good = isGoodStanding(m);

                html += '<tr>' +
                    '<td>' + m.fullName + '</td>' +
                    '<td>' + comms + '</td>' +
                    '<td>' + m.meetings[currentPeriod] + '/' + TOTALS[currentPeriod].meetings + '</td>' +
                    '<td>' + m.projects[currentPeriod] + '/' + TOTALS[currentPeriod].projects + '</td>' +
                    '<td>' + pct + '%</td>' +
                    '<td style="color:' + (good ? '#27ae60' : '#e74c3c') + '">' + (good ? '&#10003; Good' : '&#10007; Check') + '</td>' +
                '</tr>';
            });
            tbody.innerHTML = html;
        }

        // ============================================
        // MODAL FUNCTIONS
        // ============================================
        function showMemberDetails(name) {
            var m = members.find(function(mem) { return mem.fullName === name; });
            if (!m) return;

            currentMemberForExport = m;

            var modal = document.getElementById('memberModal');
            var content = document.getElementById('modalContent');
            var committees = getCommittees(m.fullName);

            var attendedHtml = '';
            if (m.meetingDetails[currentPeriod].length > 0) {
                m.meetingDetails[currentPeriod].forEach(function(md) {
                    attendedHtml += '<div class="meeting-item"><span class="meeting-date">' + md.date + '</span><span class="meeting-type">' + md.type + '</span></div>';
                });
            } else {
                attendedHtml = '<div style="color:#95a5a6;padding:10px;">No meetings attended this period</div>';
            }

            var missedHtml = '<div style="color:#27ae60;padding:10px;">No meetings missed - Great job!</div>';

            content.innerHTML = '<div class="modal-header">' +
                '<div class="modal-name">' + m.fullName + '</div>' +
                '<div class="modal-email">' + (m.email || 'No email on file') + '</div>' +
                (m.contact ? '<div class="modal-contact">Tel: ' + m.contact + '</div>' : '') +
            '</div>' +

            '<div class="detail-section">' +
                '<div class="detail-title">Personal Information</div>' +
                '<div class="detail-grid">' +
                    '<div class="detail-card"><div class="detail-label">Birthday</div><div class="detail-value">' + formatDate(m.dateOfBirth) + (m.age ? ' (Age ' + m.age + ')' : '') + '</div></div>' +
                    '<div class="detail-card"><div class="detail-label">Date Inducted</div><div class="detail-value">' + formatDate(m.dateInducted) + '</div></div>' +
                    '<div class="detail-card"><div class="detail-label">Years in RCUG</div><div class="detail-value">' + (m.yearsOfService !== null ? m.yearsOfService + ' year' + (m.yearsOfService !== 1 ? 's' : '') : 'N/A') + '</div></div>' +
                    '<div class="detail-card"><div class="detail-label">Category</div><div class="detail-value">' + m.category + '</div></div>' +
                    '<div class="detail-card full-width"><div class="detail-label">Committees</div><div class="detail-value">' + (committees.length > 0 ? committees.join(', ') : 'None assigned') + '</div></div>' +
                '</div>' +
            '</div>' +

            '<div class="detail-section">' +
                '<div class="detail-title">Attendance - ' + currentPeriod.toUpperCase() + '</div>' +
                '<div class="detail-grid">' +
                    '<div class="detail-card"><div class="detail-label">Meetings Attended</div><div class="detail-value">' + m.meetings[currentPeriod] + ' / ' + TOTALS[currentPeriod].meetings + ' (' + Math.round((m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100) + '%)</div></div>' +
                    '<div class="detail-card"><div class="detail-label">Projects Attended</div><div class="detail-value">' + m.projects[currentPeriod] + ' / ' + TOTALS[currentPeriod].projects + '</div></div>' +
                '</div>' +
            '</div>' +

            '<div class="detail-section">' +
                '<div class="detail-title">Meeting Details</div>' +
                '<div class="detail-grid">' +
                    '<div class="detail-card"><div class="detail-label">Attended</div><div class="meeting-list">' + attendedHtml + '</div></div>' +
                    '<div class="detail-card"><div class="detail-label">Status</div><div class="meeting-list">' + missedHtml + '</div></div>' +
                '</div>' +
            '</div>';

            modal.style.display = 'flex';
        }

        function closeModal(event) {
            if (!event || event.target.id === 'memberModal') {
                document.getElementById('memberModal').style.display = 'none';
                currentMemberForExport = null;
            }
        }

        // ============================================
        // EXPORT FUNCTIONS
        // ============================================
        function exportCurrentMember() {
            if (currentMemberForExport) {
                exportMemberCard(currentMemberForExport.fullName);
            }
        }

        async function exportMemberCard(name) {
            var m = members.find(function(mem) { return mem.fullName === name; });
            if (!m) return;

            var pct = Math.round((m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100);
            var committees = getCommittees(m.fullName);

            var attendedList = m.meetingDetails[currentPeriod].length > 0
                ? m.meetingDetails[currentPeriod].map(function(md) { return '<li>' + md.date + ' - ' + md.type + '</li>'; }).join('')
                : '<li>None</li>';

            var printDiv = document.createElement('div');
            printDiv.style.cssText = 'position:fixed;left:-9999px;width:800px;padding:40px;background:white;color:black;font-family:Arial,sans-serif;';
            printDiv.innerHTML = '<div style="text-align:center;margin-bottom:30px;">' +
                '<h1 style="color:#e91e63;margin:0;">Rotaract Club of University of Guyana</h1>' +
                '<h2 style="color:#666;margin:10px 0 0 0;">Member Attendance Report</h2>' +
                '<p style="color:#999;">Period: ' + currentPeriod.toUpperCase() + '</p>' +
            '</div>' +
            '<div style="border:2px solid #e91e63;border-radius:10px;padding:20px;">' +
                '<h2 style="margin-top:0;color:#333;">' + m.fullName + '</h2>' +
                '<p><strong>Email:</strong> ' + (m.email || 'N/A') + '</p>' +
                '<p><strong>Contact:</strong> ' + (m.contact || 'N/A') + '</p>' +
                '<p><strong>Category:</strong> ' + m.category + '</p>' +
                '<p><strong>Committees:</strong> ' + (committees.length > 0 ? committees.join(', ') : 'None') + '</p>' +
                '<hr style="margin:15px 0;">' +
                '<h3 style="color:#333;">Attendance Summary</h3>' +
                '<p><strong>Meetings:</strong> ' + m.meetings[currentPeriod] + '/' + TOTALS[currentPeriod].meetings + ' (' + pct + '%)</p>' +
                '<p><strong>Projects:</strong> ' + m.projects[currentPeriod] + '/' + TOTALS[currentPeriod].projects + '</p>' +
                '<p><strong>Status:</strong> <span style="color:' + (pct >= 60 ? 'green' : 'red') + ';">' + (pct >= 60 ? 'Good Standing' : 'Needs Attention') + '</span></p>' +
                '<hr style="margin:15px 0;">' +
                '<h3 style="color:#333;">Meetings Attended</h3>' +
                '<ul>' + attendedList + '</ul>' +
            '</div>' +
            '<div style="text-align:center;margin-top:20px;color:#666;font-size:12px;">' +
                'Generated: ' + new Date().toLocaleString() +
            '</div>';

            document.body.appendChild(printDiv);

            try {
                var canvas = await html2canvas(printDiv, { scale: 2, backgroundColor: '#ffffff' });
                var imgData = canvas.toDataURL('image/png');

                var jsPDF = window.jspdf.jsPDF;
                var pdf = new jsPDF('p', 'mm', 'a4');
                var imgWidth = 210;
                var imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save(m.fullName.replace(/\\s+/g, '_') + '_Attendance_Report.pdf');
            } catch (error) {
                console.error('Export error:', error);
                alert('Error generating PDF. Please try again.');
            } finally {
                document.body.removeChild(printDiv);
            }
        }

        function exportBirthdays() {
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var data = members.filter(function(m) {
                if (!m.dateOfBirth || m.isTerminated) return false;
                var d = new Date(m.dateOfBirth);
                if (isNaN(d)) return false;
                if (currentBirthdayMonth === 'all') return true;
                return (d.getMonth() + 1) === parseInt(currentBirthdayMonth);
            });

            if (data.length === 0) {
                alert('No birthdays to export');
                return;
            }

            var csv = 'Name,Month,Day,Turning Age\\n';
            data.forEach(function(m) {
                var d = new Date(m.dateOfBirth);
                csv += '"' + m.fullName + '",' + monthNames[d.getMonth() + 1] + ',' + d.getDate() + ',' + ((m.age || 0) + 1) + '\\n';
            });

            downloadCSV(csv, 'RCUG_Birthdays_' + (currentBirthdayMonth === 'all' ? 'All' : monthNames[parseInt(currentBirthdayMonth)]) + '.csv');
        }

        function exportAnniversaries() {
            var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var data = members.filter(function(m) {
                if (!m.dateInducted || m.isTerminated) return false;
                var d = new Date(m.dateInducted);
                if (isNaN(d)) return false;
                if (currentAnniversaryMonth === 'all') return true;
                return (d.getMonth() + 1) === parseInt(currentAnniversaryMonth);
            });

            if (data.length === 0) {
                alert('No anniversaries to export');
                return;
            }

            var csv = 'Name,Month,Day,Years in RCUG\\n';
            data.forEach(function(m) {
                var d = new Date(m.dateInducted);
                csv += '"' + m.fullName + '",' + monthNames[d.getMonth() + 1] + ',' + d.getDate() + ',' + ((m.yearsOfService || 0) + 1) + '\\n';
            });

            downloadCSV(csv, 'RCUG_Anniversaries_' + (currentAnniversaryMonth === 'all' ? 'All' : monthNames[parseInt(currentAnniversaryMonth)]) + '.csv');
        }

        function exportSummary() {
            var active = members.filter(function(m) { return !m.isTerminated; });

            var csv = 'Name,Committees,Meetings,Projects,Overall %,Status\\n';
            active.forEach(function(m) {
                var pct = Math.round((m.meetings[currentPeriod] / TOTALS[currentPeriod].meetings) * 100);
                var comms = getCommittees(m.fullName).join('; ') || '-';
                csv += '"' + m.fullName + '","' + comms + '",' + m.meetings[currentPeriod] + '/' + TOTALS[currentPeriod].meetings + ',' + m.projects[currentPeriod] + '/' + TOTALS[currentPeriod].projects + ',' + pct + '%,' + (pct >= 60 ? 'Good Standing' : 'Needs Attention') + '\\n';
            });

            downloadCSV(csv, 'RCUG_Attendance_Summary_' + currentPeriod.toUpperCase() + '.csv');
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

        // ============================================
        // INITIALIZE
        // ============================================
        loadAllData();
    <\/script>
</body>
</html>`;
