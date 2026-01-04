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
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab { padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .tab.members { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
        .tab.members.active, .tab.members:hover { background: #2ecc71; color: #fff; }
        .tab.guests { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
        .tab.guests.active, .tab.guests:hover { background: #f1c40f; color: #333; }
        .controls { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin-bottom: 20px; display: flex; gap: 15px; flex-wrap: wrap; align-items: center; }
        .search-input { flex: 1; min-width: 200px; padding: 12px 16px; border: none; border-radius: 10px; font-size: 1rem; background: rgba(255,255,255,0.9); color: #333; }
        .filter-select { padding: 12px 16px; border: none; border-radius: 10px; font-size: 1rem; background: rgba(255,255,255,0.9); color: #333; cursor: pointer; }
        .refresh-btn { padding: 12px 20px; border: none; border-radius: 10px; font-size: 1rem; background: #3498db; color: #fff; cursor: pointer; font-weight: 600; }
        .refresh-btn:hover { background: #2980b9; }
        .stats-bar { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
        .stat-box { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 15px 25px; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: 700; color: #f1c40f; }
        .stat-label { font-size: 0.8rem; color: #bdc3c7; }
        .member-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
        .member-card { background: rgba(255,255,255,0.08); border-radius: 15px; padding: 20px; transition: transform 0.3s, box-shadow 0.3s; cursor: pointer; border-left: 4px solid #2ecc71; }
        .member-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
        .member-card.guest { border-left-color: #f1c40f; }
        .member-card.good { border-left-color: #2ecc71; }
        .member-card.notgood { border-left-color: #e74c3c; }
        .member-card.eligible { border-left-color: #9b59b6; box-shadow: 0 0 15px rgba(155, 89, 182, 0.3); }
        .member-card.nodata { background: rgba(231, 76, 60, 0.25); border: 2px solid #e74c3c; border-left: 4px solid #e74c3c; }
        .member-card.terminated { background: rgba(127, 140, 141, 0.2); border-left-color: #7f8c8d; opacity: 0.8; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
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
        .progress-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 0.85rem; }
        .progress-label { width: 100px; color: #bdc3c7; }
        .progress-bar { flex: 1; height: 10px; background: rgba(255,255,255,0.15); border-radius: 5px; overflow: hidden; margin: 0 10px; }
        .progress-fill { height: 100%; border-radius: 5px; transition: width 0.5s; }
        .progress-fill.meetings { background: linear-gradient(90deg, #3498db, #2980b9); }
        .progress-fill.projects { background: linear-gradient(90deg, #e74c3c, #c0392b); }
        .progress-fill.good { background: linear-gradient(90deg, #27ae60, #1e8449); }
        .progress-fill.board { background: linear-gradient(90deg, #9b59b6, #8e44ad); }
        .progress-value { width: 110px; text-align: right; font-weight: 600; font-size: 0.8rem; }
        .checklist { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
        .check-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; margin-bottom: 5px; }
        .check-done { color: #27ae60; }
        .check-pending { color: #e74c3c; }
        .board-indicator { margin-top: 10px; padding: 8px 12px; background: rgba(155, 89, 182, 0.15); border-radius: 8px; border-left: 3px solid #9b59b6; }
        .board-indicator-text { font-size: 0.8rem; color: #9b59b6; }
        .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
        .modal-content { background: linear-gradient(135deg, #2c3e50, #1a1a2e); border-radius: 20px; padding: 30px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; }
        .close-btn { position: absolute; top: 15px; right: 20px; font-size: 1.5rem; cursor: pointer; color: #bdc3c7; }
        .close-btn:hover { color: #e74c3c; }
        .modal-header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .modal-name { font-size: 1.8rem; margin-bottom: 5px; }
        .modal-email { color: #bdc3c7; font-size: 0.9rem; }
        .modal-contact { color: #3498db; font-size: 0.9rem; margin-top: 3px; }
        .detail-section { margin-bottom: 20px; }
        .detail-title { font-size: 1rem; font-weight: 600; color: #f1c40f; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .detail-title svg { width: 18px; height: 18px; fill: #f1c40f; }
        .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .detail-card { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 15px; }
        .detail-card.full-width { grid-column: 1 / -1; }
        .detail-card h4 { font-size: 0.9rem; margin-bottom: 10px; color: #ecf0f1; }
        .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.85rem; }
        .detail-row span:first-child { color: #bdc3c7; }
        .detail-text { color: #ecf0f1; font-size: 0.9rem; line-height: 1.6; }
        .info-chip { display: inline-block; background: rgba(52, 152, 219, 0.2); border: 1px solid #3498db; color: #3498db; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; margin-right: 6px; margin-bottom: 6px; }
        .requirements-list { list-style: none; }
        .requirements-list li { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; font-size: 0.9rem; }
        .requirements-list li:last-child { border-bottom: none; }
        .req-met { color: #27ae60; }
        .req-notmet { color: #e74c3c; }
        .req-pending { color: #f1c40f; }
        .missed-section { background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); border-radius: 10px; padding: 15px; margin-top: 20px; }
        .missed-section h4 { color: #e74c3c; margin-bottom: 10px; }
        .missed-list { list-style: none; }
        .missed-list li { padding: 6px 0; font-size: 0.85rem; color: #bdc3c7; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .missed-list li:last-child { border-bottom: none; }
        .missed-list li::before { content: '✗ '; color: #e74c3c; }
        .attended-section { background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); border-radius: 10px; padding: 15px; margin-top: 20px; }
        .attended-section h4 { color: #27ae60; margin-bottom: 10px; }
        .attended-list { list-style: none; }
        .attended-list li { padding: 6px 0; font-size: 0.85rem; color: #bdc3c7; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .attended-list li:last-child { border-bottom: none; }
        .attended-list li::before { content: '✓ '; color: #27ae60; }
        .no-results { text-align: center; padding: 50px; color: #bdc3c7; }
        .last-updated { text-align: center; color: #7f8c8d; font-size: 0.8rem; margin-top: 20px; }
        @media (max-width: 600px) { 
            h1 { font-size: 1.6rem; } 
            .member-grid { grid-template-columns: 1fr; } 
            .detail-grid { grid-template-columns: 1fr; }
            .modal-content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>RCUG Member Progress Dashboard</h1>
            <p class="subtitle">Rotary Year 2025-2026 • Live Data from Google Sheets</p>
        </header>
        <div id="loadingMessage" class="loading">Loading data from Google Sheets...</div>
        <div id="errorMessage" class="error" style="display:none;"></div>
        <div id="mainContent" style="display:none;">
            <div class="tabs">
                <div class="tab members active" onclick="setTab('members')">Registered Members</div>
                <div class="tab guests" onclick="setTab('guests')">Guests & Prospective</div>
            </div>
            <div class="stats-bar" id="statsBar"></div>
            <div class="controls">
                <input type="text" id="searchInput" class="search-input" placeholder="Search by name...">
                <select id="periodFilter" class="filter-select">
                    <option value="q1">Q1 (Jul-Sep)</option>
                    <option value="q2">Q2 (Oct-Nov)</option>
                    <option value="h1" selected>H1 (Jul-Nov)</option>
                    <option value="elections">Elections (H1 + Jan)</option>
                </select>
                <select id="statusFilter" class="filter-select"><option value="all">All Status</option></select>
                <button class="refresh-btn" onclick="loadAllData()">↻ Refresh</button>
            </div>
            <div id="memberGrid" class="member-grid"></div>
            <div id="lastUpdated" class="last-updated"></div>
        </div>
        <div id="modal" class="modal">
            <div class="modal-content">
                <span class="close-btn" onclick="closeModal()">&times;</span>
                <div id="modalBody"></div>
            </div>
        </div>
    </div>
    <script>
        const SHEET_ID = '1j0uOvYCe-DvOsPjxyb7RfLm7ddeB_LL99cJKeO40RaM';
        // NO CORS proxy for Cloudflare Workers deployment
        const GUEST_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=\${encodeURIComponent('11. Guest Tracking Sheet')}\`;
        const MEMBER_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=\${encodeURIComponent('6. Member Registry')}\`;
        const BOARD_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=\${encodeURIComponent('10. Board Meeting Attendance')}\`;
        const ATTENDANCE_URL = \`https://docs.google.com/spreadsheets/d/\${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=\${encodeURIComponent('5. All Attendance')}\`;
        
        // Meeting schedule
        const ALL_MEETINGS = [
            { date: '2025-07-12', display: '12th July 2025', type: 'Business Meeting', quarter: 'Q1' },
            { date: '2025-07-26', display: '26th July 2025', type: 'Fellowship Meeting', quarter: 'Q1' },
            { date: '2025-08-08', display: '8th August 2025', type: 'Business Meeting', quarter: 'Q1' },
            { date: '2025-08-22', display: '22nd August 2025', type: 'Fellowship Meeting', quarter: 'Q1' },
            { date: '2025-09-13', display: '13th September 2025', type: 'Business Meeting', quarter: 'Q1' },
            { date: '2025-09-27', display: '27th September 2025', type: 'Fellowship Meeting', quarter: 'Q1' },
            { date: '2025-10-06', display: '6th October 2025', type: 'Business Meeting', quarter: 'Q2' },
            { date: '2025-10-24', display: '24th October 2025', type: 'Fellowship Meeting', quarter: 'Q2' },
            { date: '2025-11-08', display: '8th November 2025', type: 'Business Meeting', quarter: 'Q2' },
            { date: '2025-11-29', display: '29th November 2025', type: 'Fellowship Meeting', quarter: 'Q2' },
        ];
        
        const TOTALS = {
            q1: { meetings: 6, projects: 5 },
            q2: { meetings: 4, projects: 5 },
            h1: { meetings: 10, projects: 10 },
            elections: { meetings: 12, projects: 10 },
            boardAnnual: 12
        };
        
        const NEW_MEMBERS_DEC7 = ['Tishana Bheer', 'Liane Langford', 'Renika Anand'];
        const BOARD_MEMBERS = ['Adanna Edwards', 'Andrew Hing', 'Christine Samuels', 'Darin Hall', 'Ganesh Anand', 'Jemima Stephenson', 'Kadeem Bowen', 'Nandita Singh', 'Omari London', 'Ruth Manbodh', 'Vishal Roopnarine', 'Yushina Ramlall'];
        
        let members = [], guests = [], allAttendance = [], boardAttendance = {}, currentTab = 'members';
        
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
                
                console.log('Data loaded - memberData rows:', memberData.length);
                
                if (memberData.length === 0) throw new Error('Could not load member data');
                
                processAttendance(attData);
                processBoard(boardData);
                processGuests(guestData);
                processMembers(memberData);
                linkNewMembersData();
                calculateMemberStats();
                
                console.log('All processing complete. Members:', members.length);
                
                if (members.length === 0) {
                    throw new Error('No members found after processing. Check Member Registry sheet format.');
                }
                
                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                document.getElementById('lastUpdated').textContent = 'Updated: ' + new Date().toLocaleString();
                updateFilters();
                render();
            } catch (error) {
                console.error('Load error:', error);
                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('errorMessage').style.display = 'block';
                document.getElementById('errorMessage').innerHTML = \`<h3>⚠️ Error Loading Data</h3><p>\${error.message}</p><p style="margin-top:15px;">Make sure your Google Sheet sharing is set to "Anyone with the link"</p><p><a href="https://docs.google.com/spreadsheets/d/\${SHEET_ID}/edit" target="_blank">Open Google Sheet</a></p><p style="margin-top:10px; font-size:0.9rem;">Check browser console (F12) for detailed errors.</p>\`;
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
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }
        
        function processMembers(data) {
            members = [];
            if (!data.length) return;
            
            // Find the actual header row - skip instruction rows
            let hdr = -1;
            for (let i = 0; i < Math.min(10, data.length); i++) {
                if (data[i][0] === 'ID' || (data[i][1] && data[i][1].toString().includes('Full Name'))) {
                    hdr = i;
                    break;
                }
            }
            
            if (hdr === -1) {
                console.error('Could not find Member Registry header row');
                return;
            }
            
            console.log('Member Registry header found at row:', hdr);
            console.log('Header row:', data[hdr]);
            
            for (let i = hdr + 1; i < data.length; i++) {
                const r = data[i];
                if (!r[1] || r[1] === 'Full Name' || r[1] === '') continue;
                
                const name = r[1].toString().trim();
                if (!name) continue;
                
                const isNewDec7 = NEW_MEMBERS_DEC7.includes(name);
                const isBoardMember = BOARD_MEMBERS.includes(name);
                // Column 10 contains the Status (Active/Terminated)
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
                    terminatedDate: isTerminated ? registryStatus : null,
                    boardMeetings: boardAttendance[name] || { total: 0, q1: 0, q2: 0, q3: 0, q4: 0 },
                    q1: { meet: 0, proj: 0 }, 
                    q2: { meet: 0, proj: 0 }, 
                    h1: { meet: 0, proj: 0 },
                    jan: { bm: 0, fm: 0 }, 
                    elections: { meet: 0, pct: 0, eligible: false },
                    hasData: false, 
                    status: 'Active',
                    attendedMeetings: [], 
                    missedMeetings: []
                });
            }
            
            console.log('Processed members:', members.length);
            if (members.length > 0) {
                console.log('Sample member:', members[0].fullName, members[0].email);
            }
        }
        
        function getMeetingsAttendedAndMissed(memberName) {
            const memberAtt = allAttendance.filter(a => a.name === memberName && (a.type === 'Business Meeting' || a.type === 'Fellowship Meeting'));
            const attendedKeys = new Set(memberAtt.map(a => \`\${a.dateKey}-\${a.type}\`));
            const attended = [];
            const missed = [];
            ALL_MEETINGS.forEach(m => {
                const key = \`\${m.date}-\${m.type}\`;
                if (attendedKeys.has(key)) {
                    attended.push(m);
                } else {
                    missed.push(m);
                }
            });
            return { attended, missed };
        }
        
        function linkNewMembersData() {
            members.forEach(m => {
                if (!m.isNewDec7) return;
                const att = allAttendance.filter(a => a.name === m.fullName);
                m.hasData = att.length > 0;
                m.q1.meet = Math.min(att.filter(a => a.quarter === 'Q1' && (a.type === 'Business Meeting' || a.type === 'Fellowship Meeting')).length, TOTALS.q1.meetings);
                m.q1.proj = Math.min(att.filter(a => a.quarter === 'Q1' && a.type === 'Project').length, TOTALS.q1.projects);
                m.q2.meet = Math.min(att.filter(a => a.quarter === 'Q2' && (a.type === 'Business Meeting' || a.type === 'Fellowship Meeting')).length, TOTALS.q2.meetings);
                m.q2.proj = Math.min(att.filter(a => a.quarter === 'Q2' && a.type === 'Project').length, TOTALS.q2.projects);
                m.h1.meet = m.q1.meet + m.q2.meet;
                m.h1.proj = Math.min(m.q1.proj + m.q2.proj, TOTALS.h1.projects);
                m.jan.bm = Math.min(att.filter(a => a.month === 1 && a.type === 'Business Meeting').length, 1);
                m.jan.fm = Math.min(att.filter(a => a.month === 1 && a.type === 'Fellowship Meeting').length, 1);
                const h1Pct = (m.h1.meet / TOTALS.h1.meetings) * 100;
                m.status = h1Pct >= 60 ? 'Good Standing' : 'Not in Good Standing';
                m.elections.meet = m.h1.meet + m.jan.bm + m.jan.fm;
                m.elections.pct = (m.elections.meet / TOTALS.elections.meetings) * 100;
                m.elections.eligible = m.elections.pct >= 60;
                const { attended, missed } = getMeetingsAttendedAndMissed(m.fullName);
                m.attendedMeetings = attended;
                m.missedMeetings = missed;
            });
        }
        
        function calculateMemberStats() {
            members.forEach(m => {
                if (m.isNewDec7) return;
                if (m.isTerminated) { m.status = 'Terminated'; m.hasData = false; return; }
                const att = allAttendance.filter(a => a.name === m.fullName);
                m.hasData = att.length > 0;
                m.q1.meet = Math.min(att.filter(a => a.quarter === 'Q1' && (a.type === 'Business Meeting' || a.type === 'Fellowship Meeting')).length, TOTALS.q1.meetings);
                m.q1.proj = Math.min(att.filter(a => a.quarter === 'Q1' && a.type === 'Project').length, TOTALS.q1.projects);
                m.q2.meet = Math.min(att.filter(a => a.quarter === 'Q2' && (a.type === 'Business Meeting' || a.type === 'Fellowship Meeting')).length, TOTALS.q2.meetings);
                m.q2.proj = Math.min(att.filter(a => a.quarter === 'Q2' && a.type === 'Project').length, TOTALS.q2.projects);
                m.h1.meet = m.q1.meet + m.q2.meet;
                m.h1.proj = Math.min(m.q1.proj + m.q2.proj, TOTALS.h1.projects);
                m.jan.bm = Math.min(att.filter(a => a.month === 1 && a.type === 'Business Meeting').length, 1);
                m.jan.fm = Math.min(att.filter(a => a.month === 1 && a.type === 'Fellowship Meeting').length, 1);
                const h1Pct = (m.h1.meet / TOTALS.h1.meetings) * 100;
                m.status = !m.hasData ? 'No Data' : (h1Pct >= 60 ? 'Good Standing' : 'Not in Good Standing');
                m.elections.meet = m.h1.meet + m.jan.bm + m.jan.fm;
                m.elections.pct = (m.elections.meet / TOTALS.elections.meetings) * 100;
                m.elections.eligible = m.elections.pct >= 60 && !m.isTerminated && m.hasData;
                const { attended, missed } = getMeetingsAttendedAndMissed(m.fullName);
                m.attendedMeetings = attended;
                m.missedMeetings = missed;
            });
        }
        
        function setTab(tab) {
            currentTab = tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector(\`.tab.\${tab}\`).classList.add('active');
            document.getElementById('periodFilter').style.display = tab === 'members' ? 'block' : 'none';
            updateFilters(); 
            render();
        }
        
        function updateFilters() {
            const statusFilter = document.getElementById('statusFilter');
            const currentValue = statusFilter.value;
            statusFilter.innerHTML = '<option value="all">All Status</option>';
            if (currentTab === 'members') {
                statusFilter.innerHTML += '<option value="good">Good Standing</option><option value="notgood">Not in Good Standing</option><option value="nodata">No Data</option><option value="terminated">Terminated</option>';
            } else {
                statusFilter.innerHTML += '<option value="infosession">Attended Info</option><option value="committeeapproval">Committee Approved</option><option value="eligible">Eligible for Membership</option><option value="notug">Not UG</option>';
            }
            statusFilter.value = currentValue;
            updateStats();
        }
        
        function updateStats() {
            let data = currentTab === 'members' ? members : guests;
            const statsBar = document.getElementById('statsBar');
            if (currentTab === 'members') {
                const total = members.length;
                const good = members.filter(m => m.status === 'Good Standing').length;
                const notgood = members.filter(m => m.status === 'Not in Good Standing').length;
                const nodata = members.filter(m => m.status === 'No Data').length;
                const terminated = members.filter(m => m.isTerminated).length;
                statsBar.innerHTML = \`
                    <div class="stat-box"><div class="stat-value">\${total}</div><div class="stat-label">Total Members</div></div>
                    <div class="stat-box"><div class="stat-value">\${good}</div><div class="stat-label">Good Standing</div></div>
                    <div class="stat-box"><div class="stat-value">\${notgood}</div><div class="stat-label">Not in Good Standing</div></div>
                    <div class="stat-box"><div class="stat-value">\${nodata}</div><div class="stat-label">No Data</div></div>
                    \${terminated > 0 ? \`<div class="stat-box"><div class="stat-value">\${terminated}</div><div class="stat-label">Terminated</div></div>\` : ''}
                \`;
            } else {
                const total = guests.length;
                const attended = guests.filter(g => g.info).length;
                const committee = guests.filter(g => g.committee).length;
                const eligible = guests.filter(g => g.meetPct >= 60 && g.projPct >= 50).length;
                statsBar.innerHTML = \`
                    <div class="stat-box"><div class="stat-value">\${total}</div><div class="stat-label">Total Guests</div></div>
                    <div class="stat-box"><div class="stat-value">\${attended}</div><div class="stat-label">Attended Info</div></div>
                    <div class="stat-box"><div class="stat-value">\${committee}</div><div class="stat-label">Committee Approved</div></div>
                    <div class="stat-box"><div class="stat-value">\${eligible}</div><div class="stat-label">Eligible</div></div>
                \`;
            }
        }
        
        function render() {
            const search = document.getElementById('searchInput').value.toLowerCase();
            const status = document.getElementById('statusFilter').value;
            const period = document.getElementById('periodFilter').value;
            const grid = document.getElementById('memberGrid');
            
            let data = currentTab === 'members' ? members : guests;
            data = data.filter(d => d.fullName.toLowerCase().includes(search));
            
            if (status !== 'all') {
                if (currentTab === 'members') {
                    if (status === 'good') data = data.filter(m => m.status === 'Good Standing');
                    else if (status === 'notgood') data = data.filter(m => m.status === 'Not in Good Standing');
                    else if (status === 'nodata') data = data.filter(m => m.status === 'No Data');
                    else if (status === 'terminated') data = data.filter(m => m.isTerminated);
                } else {
                    if (status === 'infosession') data = data.filter(g => g.info);
                    else if (status === 'committeeapproval') data = data.filter(g => g.committee);
                    else if (status === 'eligible') data = data.filter(g => g.meetPct >= 60 && g.projPct >= 50);
                    else if (status === 'notug') data = data.filter(g => !g.ug);
                }
            }
            
            if (data.length === 0) {
                grid.innerHTML = '<div class="no-results">No members found</div>';
                return;
            }
            
            grid.innerHTML = data.map(d => currentTab === 'members' ? renderMemberCard(d, period) : renderGuestCard(d)).join('');
        }
        
        function renderMemberCard(m, period) {
            const cardClass = m.isTerminated ? 'terminated' : m.status === 'No Data' ? 'nodata' : m.status === 'Good Standing' ? 'good' : 'notgood';
            const statusClass = m.isTerminated ? 'status-terminated' : m.status === 'No Data' ? 'status-nodata' : m.status === 'Good Standing' ? 'status-good' : 'status-notgood';
            
            let meet = m.h1.meet, proj = m.h1.proj, totalMeet = TOTALS.h1.meetings, totalProj = TOTALS.h1.projects;
            if (period === 'q1') { meet = m.q1.meet; proj = m.q1.proj; totalMeet = TOTALS.q1.meetings; totalProj = TOTALS.q1.projects; }
            else if (period === 'q2') { meet = m.q2.meet; proj = m.q2.proj; totalMeet = TOTALS.q2.meetings; totalProj = TOTALS.q2.projects; }
            else if (period === 'elections') { meet = m.elections.meet; totalMeet = TOTALS.elections.meetings; }
            
            const meetPct = (meet / totalMeet) * 100;
            const projPct = (proj / totalProj) * 100;
            
            return \`
                <div class="member-card \${cardClass}" onclick="showModal('\${m.fullName.replace(/'/g, "\\\\'")}', 'member', '\${period}')">
                    <div class="card-header">
                        <div>
                            <div class="member-name">\${m.fullName}\${m.isNewDec7 ? '<span class="badge badge-new">NEW</span>' : ''}\${m.isBoardMember ? '<span class="badge badge-board">BOARD</span>' : ''}\${m.isTerminated ? '<span class="badge badge-terminated">TERMINATED</span>' : ''}\${!m.hasData && !m.isTerminated ? '<span class="badge badge-nodata">NO DATA</span>' : ''}</div>
                            <div class="member-tag">\${m.incomingPosition || 'Member'}</div>
                        </div>
                        <span class="status-badge \${statusClass}">\${m.status}</span>
                    </div>
                    <div class="progress-row">
                        <span class="progress-label">Meetings</span>
                        <div class="progress-bar"><div class="progress-fill meetings" style="width: \${Math.min(meetPct, 100)}%"></div></div>
                        <span class="progress-value">\${meet}/\${totalMeet} (\${meetPct.toFixed(0)}%)</span>
                    </div>
                    \${period !== 'elections' ? \`
                    <div class="progress-row">
                        <span class="progress-label">Projects</span>
                        <div class="progress-bar"><div class="progress-fill projects" style="width: \${Math.min(projPct, 100)}%"></div></div>
                        <span class="progress-value">\${proj}/\${totalProj} (\${projPct.toFixed(0)}%)</span>
                    </div>\` : ''}
                    \${m.isBoardMember ? \`
                    <div class="progress-row">
                        <span class="progress-label">Board</span>
                        <div class="progress-bar"><div class="progress-fill board" style="width: \${(m.boardMeetings.total / TOTALS.boardAnnual) * 100}%"></div></div>
                        <span class="progress-value">\${m.boardMeetings.total}/\${TOTALS.boardAnnual}</span>
                    </div>\` : ''}
                </div>
            \`;
        }
        
        function renderGuestCard(g) {
            const eligible = g.meetPct >= 60 && g.projPct >= 50;
            const statusClass = !g.ug ? 'status-notug' : !g.info ? 'status-noattendance' : !g.committee ? 'status-infosession' : eligible ? 'status-eligible' : 'status-needswork';
            const statusText = !g.ug ? 'Not UG' : !g.info ? 'Needs Info Session' : !g.committee ? 'Attended Info' : eligible ? 'Eligible' : 'Needs More Attendance';
            
            return \`
                <div class="member-card guest \${eligible ? 'eligible' : ''}" onclick="showModal('\${g.fullName.replace(/'/g, "\\\\'")}', 'guest', '')">
                    <div class="card-header">
                        <div>
                            <div class="member-name">\${g.fullName}</div>
                            <div class="member-tag">Guest</div>
                        </div>
                        <span class="status-badge \${statusClass}">\${statusText}</span>
                    </div>
                    <div class="progress-row">
                        <span class="progress-label">Meetings</span>
                        <div class="progress-bar"><div class="progress-fill meetings" style="width: \${Math.min(g.meetPct, 100)}%"></div></div>
                        <span class="progress-value">\${g.meetings}/\${TOTALS.h1.meetings} (\${g.meetPct.toFixed(0)}%)</span>
                    </div>
                    <div class="progress-row">
                        <span class="progress-label">Projects</span>
                        <div class="progress-bar"><div class="progress-fill projects" style="width: \${Math.min(g.projPct, 100)}%"></div></div>
                        <span class="progress-value">\${g.projects}/\${TOTALS.h1.projects} (\${g.projPct.toFixed(0)}%)</span>
                    </div>
                    <div class="checklist">
                        <div class="check-item \${g.ug ? 'check-done' : 'check-pending'}">\${g.ug ? '✓' : '✗'} UG Student/Alumni</div>
                        <div class="check-item \${g.info ? 'check-done' : 'check-pending'}">\${g.info ? '✓' : '✗'} Info Session</div>
                        <div class="check-item \${g.committee ? 'check-done' : 'check-pending'}">\${g.committee ? '✓' : '✗'} Committee Approval</div>
                        <div class="check-item \${eligible ? 'check-done' : 'check-pending'}">\${eligible ? '✓' : '✗'} Attendance Met (60%+ & 50%+)</div>
                    </div>
                </div>
            \`;
        }
        
        function showModal(name, type, period) {
            const modal = document.getElementById('modal');
            const modalBody = document.getElementById('modalBody');
            
            if (type === 'member') {
                const m = members.find(mem => mem.fullName === name);
                if (!m) return;
                
                let meet = m.h1.meet, proj = m.h1.proj, totalMeet = TOTALS.h1.meetings, totalProj = TOTALS.h1.projects;
                if (period === 'q1') { meet = m.q1.meet; proj = m.q1.proj; totalMeet = TOTALS.q1.meetings; totalProj = TOTALS.q1.projects; }
                else if (period === 'q2') { meet = m.q2.meet; proj = m.q2.proj; totalMeet = TOTALS.q2.meetings; totalProj = TOTALS.q2.projects; }
                else if (period === 'elections') { meet = m.elections.meet; totalMeet = TOTALS.elections.meetings; }
                
                const meetPct = (meet / totalMeet) * 100;
                const projPct = period !== 'elections' ? (proj / totalProj) * 100 : 0;
                
                const armsArray = m.armsOfService ? m.armsOfService.split(',').map(s => s.trim()).filter(s => s) : [];
                
                modalBody.innerHTML = \`
                    <div class="modal-header">
                        <div class="modal-name">\${m.fullName}</div>
                        <div class="modal-email">\${m.email}</div>
                        \${m.contact ? \`<div class="modal-contact">📞 \${m.contact}</div>\` : ''}
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">📊 Attendance Summary</div>
                        <div class="detail-grid">
                            <div class="detail-card">
                                <h4>Meetings</h4>
                                <div class="progress-row">
                                    <div class="progress-bar"><div class="progress-fill meetings" style="width: \${Math.min(meetPct, 100)}%"></div></div>
                                    <span class="progress-value">\${meet}/\${totalMeet} (\${meetPct.toFixed(0)}%)</span>
                                </div>
                            </div>
                            \${period !== 'elections' ? \`
                            <div class="detail-card">
                                <h4>Projects</h4>
                                <div class="progress-row">
                                    <div class="progress-bar"><div class="progress-fill projects" style="width: \${Math.min(projPct, 100)}%"></div></div>
                                    <span class="progress-value">\${proj}/\${totalProj} (\${projPct.toFixed(0)}%)</span>
                                </div>
                            </div>\` : ''}
                            \${m.isBoardMember ? \`
                            <div class="detail-card">
                                <h4>Board Meetings</h4>
                                <div class="progress-row">
                                    <div class="progress-bar"><div class="progress-fill board" style="width: \${(m.boardMeetings.total / TOTALS.boardAnnual) * 100}%"></div></div>
                                    <span class="progress-value">\${m.boardMeetings.total}/\${TOTALS.boardAnnual}</span>
                                </div>
                            </div>\` : ''}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">👤 Personal Information</div>
                        <div class="detail-grid">
                            \${m.dateOfBirth ? \`
                            <div class="detail-card">
                                <h4>Birthday & Age</h4>
                                <div class="detail-text">🎂 \${formatDate(m.dateOfBirth)}\${m.age ? \` (\${m.age} years old)\` : ''}</div>
                            </div>\` : ''}
                            \${m.dateInducted ? \`
                            <div class="detail-card">
                                <h4>Date Inducted</h4>
                                <div class="detail-text">📅 \${formatDate(m.dateInducted)}</div>
                            </div>\` : ''}
                            \${m.education ? \`
                            <div class="detail-card full-width">
                                <h4>Education</h4>
                                <div class="detail-text">🎓 \${m.education}</div>
                            </div>\` : ''}
                            \${m.profession ? \`
                            <div class="detail-card full-width">
                                <h4>Current Profession</h4>
                                <div class="detail-text">💼 \${m.profession}</div>
                            </div>\` : ''}
                        </div>
                    </div>
                    
                    \${m.talentsHobbies ? \`
                    <div class="detail-section">
                        <div class="detail-title">✨ Talents & Hobbies</div>
                        <div class="detail-card full-width">
                            <div class="detail-text">\${m.talentsHobbies}</div>
                        </div>
                    </div>\` : ''}
                    
                    \${armsArray.length > 0 ? \`
                    <div class="detail-section">
                        <div class="detail-title">🎯 Arms of Service Interests</div>
                        <div class="detail-card full-width">
                            \${armsArray.map(arm => \`<span class="info-chip">\${arm}</span>\`).join('')}
                        </div>
                    </div>\` : ''}
                    
                    \${m.incomingPosition && m.incomingPosition !== 'NIL' && m.incomingPosition !== 'Member' ? \`
                    <div class="detail-section">
                        <div class="detail-title">👔 Incoming Position (2025-2026)</div>
                        <div class="detail-card full-width">
                            <div class="detail-text"><strong>\${m.incomingPosition}</strong></div>
                        </div>
                    </div>\` : ''}
                    
                    \${m.positionsHeld && m.positionsHeld !== 'NIL' ? \`
                    <div class="detail-section">
                        <div class="detail-title">📜 Past Positions</div>
                        <div class="detail-card full-width">
                            <div class="detail-text" style="white-space: pre-line;">\${m.positionsHeld}</div>
                        </div>
                    </div>\` : ''}
                    
                    \${m.attendedMeetings.length > 0 ? \`
                    <div class="attended-section">
                        <h4>✓ Meetings Attended (\${m.attendedMeetings.length})</h4>
                        <ul class="attended-list">
                            \${m.attendedMeetings.map(mtg => \`<li>\${mtg.display} - \${mtg.type}</li>\`).join('')}
                        </ul>
                    </div>\` : ''}
                    
                    \${m.missedMeetings.length > 0 ? \`
                    <div class="missed-section">
                        <h4>✗ Meetings Missed (\${m.missedMeetings.length})</h4>
                        <ul class="missed-list">
                            \${m.missedMeetings.map(mtg => \`<li>\${mtg.display} - \${mtg.type}</li>\`).join('')}
                        </ul>
                    </div>\` : ''}
                \`;
            } else {
                const g = guests.find(gst => gst.fullName === name);
                if (!g) return;
                
                const eligible = g.meetPct >= 60 && g.projPct >= 50;
                
                modalBody.innerHTML = \`
                    <div class="modal-header">
                        <div class="modal-name">\${g.fullName}</div>
                        <div class="member-tag">Guest / Prospective Member</div>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">📊 Progress to Membership</div>
                        <ul class="requirements-list">
                            <li><span>UG Student/Alumni</span><span class="\${g.ug ? 'req-met' : 'req-notmet'}">\${g.ug ? '✓ Yes' : '✗ No'}</span></li>
                            <li><span>Attended Info Session</span><span class="\${g.info ? 'req-met' : 'req-notmet'}">\${g.info ? '✓ Yes' : '✗ No'}</span></li>
                            <li><span>Committee Approval</span><span class="\${g.committee ? 'req-met' : 'req-notmet'}">\${g.committee ? '✓ Yes' : '✗ No'}</span></li>
                            <li><span>Meeting Attendance (60%)</span><span class="\${g.meetPct >= 60 ? 'req-met' : 'req-notmet'}">\${g.meetings}/\${TOTALS.h1.meetings} (\${g.meetPct.toFixed(0)}%)</span></li>
                            <li><span>Project Participation (50%)</span><span class="\${g.projPct >= 50 ? 'req-met' : 'req-notmet'}">\${g.projects}/\${TOTALS.h1.projects} (\${g.projPct.toFixed(0)}%)</span></li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">🎯 Eligibility Status</div>
                        <div class="detail-card full-width">
                            <div class="detail-text" style="font-size: 1.1rem; font-weight: 600; color: \${eligible ? '#27ae60' : '#e74c3c'};">
                                \${eligible ? '✓ Eligible for Membership' : '✗ Not Yet Eligible'}
                            </div>
                            \${!eligible ? \`<div class="detail-text" style="margin-top: 10px; color: #bdc3c7;">
                                \${g.meetPct < 60 ? \`Need \${Math.ceil((60 * TOTALS.h1.meetings / 100) - g.meetings)} more meetings. \` : ''}
                                \${g.projPct < 50 ? \`Need \${Math.ceil((50 * TOTALS.h1.projects / 100) - g.projects)} more projects.\` : ''}
                            </div>\` : ''}
                        </div>
                    </div>
                \`;
            }
            
            modal.style.display = 'flex';
        }
        
        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }
        
        document.getElementById('searchInput').addEventListener('input', render);
        document.getElementById('statusFilter').addEventListener('change', render);
        document.getElementById('periodFilter').addEventListener('change', render);
        
        window.onclick = function(event) {
            const modal = document.getElementById('modal');
            if (event.target === modal) closeModal();
        };
        
        loadAllData();
    </script>
</body>
</html>`;
