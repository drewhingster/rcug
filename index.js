// ============================================
// RCUG MEMBER PROGRESS DASHBOARD - VERSION 6
// Rotaract Club of University of Guyana
// Rotary Year 2025-2026
// ============================================

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
    'Andrew Hing' // Assistant Secretary & Membership Chair
];

// ============================================
// MEETING TYPES (Including Committee Meetings)
// ============================================
const MEETING_TYPES = [
    'Business Meeting',
    'Fellowship Meeting',
    'Project',
    'Board Meeting',
    'Committee Meeting - Club Service',
    'Committee Meeting - Community Service',
    'Committee Meeting - Finance',
    'Committee Meeting - International Service',
    'Committee Meeting - Professional Development',
    'Committee Meeting - Membership',
    'Committee Meeting - Public Image'
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
    const url = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;
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
    const lines = text.split('\n');
    if (lines.length < 2) return [];
    
    // Parse headers (first row)
    const headers = parseCSVLine(lines[0]);
    
    // Parse data rows
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
        // Fetch all data from Google Sheets
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
        
        // Calculate attendance stats for members
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
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        el.style.display = show ? 'block' : 'none';
    });
}

function showError(message) {
    const container = document.getElementById('memberCards');
    container.innerHTML = `<div class="error-message">${message}</div>`;
}

// ============================================
// DATA PROCESSING
// ============================================
function processMembers(rawData) {
    // Skip header rows if they exist
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
            category: row['Category'] || 'Rotaractor',
            ugStatus: row['UG Status'] || '',
            profession: row['Current Profession:'] || row['Profession'] || '',
            education: row['Educational Background (Area of Study at UG - Please specify your major)'] || ''
        }));
}

function processGuests(rawData) {
    return rawData
        .filter(row => row['First Name'] && row['First Name'] !== 'First Name' && !row['First Name'].includes('CLUB REGISTER'))
        .map(row => ({
            name: `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim(),
            firstName: row['First Name'] || '',
            lastName: row['Last Name'] || '',
            status: row['Status'] || 'NO ATTENDANCE',
            meetingAttendance: parseInt(row['Total out of Six (Meetings)']) || 0,
            totalMeetings: 6,
            meetingPercentage: parseFloat(row['% Total Meetings \n(Req. 60%)']) * 100 || 0,
            projectAttendance: parseInt(row['Total out of Five (Projects)']) || 0,
            totalProjects: 5,
            projectPercentage: parseFloat(row['% Total Projects \n(Req. 50%)']) * 100 || 0,
            infoSession: row['Information Session'] === 'TRUE' || row['Information Session'] === true,
            committeeMeeting: row['Committee Meeting'] === 'TRUE' || row['Committee Meeting'] === true,
            ugStudent: row['Current or Graduate of UG'] === 'TRUE' || row['Current or Graduate of UG'] === true
        }));
}

function calculateMemberAttendance() {
    const period = currentPeriod;
    
    memberData.forEach(member => {
        // Filter attendance for this member and period
        const memberAttendance = attendanceData.filter(a => {
            const fullName = a['Full Name'] || `${a['First Name']} ${a['Last Name']}`.trim();
            const matchesName = fullName.toLowerCase() === member.name.toLowerCase();
            const matchesPeriod = period === 'Annual' || a['Quarter'] === period || 
                                  (period === 'H1' && (a['Quarter'] === 'Q1' || a['Quarter'] === 'Q2')) ||
                                  (period === 'H2' && (a['Quarter'] === 'Q3' || a['Quarter'] === 'Q4'));
            return matchesName && matchesPeriod;
        });
        
        // Count by meeting type
        member.businessMeetings = memberAttendance.filter(a => 
            a['Meeting Type'] === 'Business Meeting').length;
        member.fellowshipMeetings = memberAttendance.filter(a => 
            a['Meeting Type'] === 'Fellowship Meeting').length;
        member.projects = memberAttendance.filter(a => 
            a['Meeting Type'] === 'Project').length;
        member.committeeMeetings = memberAttendance.filter(a => 
            a['Meeting Type'] && a['Meeting Type'].includes('Committee Meeting')).length;
        member.boardMeetings = memberAttendance.filter(a => 
            a['Meeting Type'] === 'Board Meeting').length;
        
        // Calculate totals based on meeting schedule
        const periodMeetings = meetingSchedule.filter(m => {
            const matchesPeriod = period === 'Annual' || m['Quarter'] === period ||
                                  (period === 'H1' && (m['Quarter'] === 'Q1' || m['Quarter'] === 'Q2')) ||
                                  (period === 'H2' && (m['Quarter'] === 'Q3' || m['Quarter'] === 'Q4'));
            return matchesPeriod;
        });
        
        member.totalBusinessMeetings = periodMeetings.filter(m => m['Type'] === 'Business Meeting').length || 2;
        member.totalFellowshipMeetings = periodMeetings.filter(m => m['Type'] === 'Fellowship Meeting').length || 2;
        member.totalProjects = periodMeetings.filter(m => m['Type'] === 'Project').length || 5;
        
        // Calculate overall percentage (Business + Fellowship meetings)
        const totalRegularMeetings = member.totalBusinessMeetings + member.totalFellowshipMeetings;
        const attendedRegularMeetings = member.businessMeetings + member.fellowshipMeetings;
        member.overallPercentage = totalRegularMeetings > 0 
            ? Math.round((attendedRegularMeetings / totalRegularMeetings) * 100) 
            : 0;
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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateYearsInducted(dateString) {
    if (!dateString) return 0;
    const today = new Date();
    const inductedDate = new Date(dateString);
    if (isNaN(inductedDate.getTime())) return 0;
    let years = today.getFullYear() - inductedDate.getFullYear();
    const monthDiff = today.getMonth() - inductedDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < inductedDate.getDate())) {
        years--;
    }
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

function getCommittees(name) {
    return COMMITTEE_ASSIGNMENTS[name] || [];
}

function isOnBoard(name) {
    return BOARD_MEMBERS.includes(name);
}

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
    // Period selector
    document.getElementById('periodSelect').addEventListener('change', (e) => {
        currentPeriod = e.target.value;
        calculateMemberAttendance();
        renderAll();
    });

    // Filters
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
        const isTerminated = m.status && m.status.toLowerCase().includes('terminated');
        if (statusFilter === 'good' && (!isGoodStanding(m) || isTerminated)) return false;
        if (statusFilter === 'not-good' && (isGoodStanding(m) || isTerminated)) return false;
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
        const isTerminated = member.status && member.status.toLowerCase().includes('terminated');
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
                    <p>📧 ${member.email || '-'}</p>
                    <p>📱 ${member.contact || '-'}</p>
                    <p>🎂 Age: ${age} | 🗓️ Member for ${yearsInducted} year${yearsInducted !== 1 ? 's' : ''}</p>
                    <p>📅 Inducted: ${formatFullDate(member.inducted)}</p>
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
                                 style="width: ${Math.min(member.businessMeetings/member.totalBusinessMeetings*100, 100)}%"></div>
                        </div>
                    </div>
                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Fellowship Meetings</span>
                            <span>${member.fellowshipMeetings}/${member.totalFellowshipMeetings}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${getProgressClass(member.fellowshipMeetings/member.totalFellowshipMeetings*100)}" 
                                 style="width: ${Math.min(member.fellowshipMeetings/member.totalFellowshipMeetings*100, 100)}%"></div>
                        </div>
                    </div>
                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Projects</span>
                            <span>${member.projects}/${member.totalProjects}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${getProgressClass(member.projects/member.totalProjects*100)}" 
                                 style="width: ${Math.min(member.projects/member.totalProjects*100, 100)}%"></div>
                        </div>
                    </div>
                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Committee Meetings</span>
                            <span>${member.committeeMeetings}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill good" 
                                 style="width: ${member.committeeMeetings > 0 ? '100' : '0'}%"></div>
                        </div>
                    </div>
                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Overall Attendance (60% req.)</span>
                            <span>${member.overallPercentage}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${getProgressClass(member.overallPercentage)}" 
                                 style="width: ${Math.min(member.overallPercentage, 100)}%"></div>
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

    // Filter out guests who are now members
    const memberNames = memberData.map(m => m.name.toLowerCase());
    
    let filtered = guestData.filter(g => {
        if (searchTerm && !g.name.toLowerCase().includes(searchTerm)) return false;
        // Exclude if they're now a member
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
                            <span>${guest.meetingAttendance}/${guest.totalMeetings} (${Math.round(guest.meetingPercentage)}%)</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${getProgressClass(guest.meetingPercentage)}" 
                                 style="width: ${Math.min(guest.meetingPercentage, 100)}%"></div>
                        </div>
                    </div>
                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Project Participation (50% req.)</span>
                            <span>${guest.projectAttendance}/${guest.totalProjects} (${Math.round(guest.projectPercentage)}%)</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${getProgressClass(guest.projectPercentage * 1.2)}" 
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
                    <div class="checklist-item ${meetingMet ? 'completed' : 'pending'}">
                        <span class="checklist-icon">${meetingMet ? '✅' : '⬜'}</span>
                        <span>60% Meetings</span>
                    </div>
                    <div class="checklist-item ${projectMet ? 'completed' : 'pending'}">
                        <span class="checklist-icon">${projectMet ? '✅' : '⬜'}</span>
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
        if (!m.dob) return false;
        const isTerminated = m.status && m.status.toLowerCase().includes('terminated');
        if (isTerminated) return false;
        
        const date = new Date(m.dob);
        if (isNaN(date.getTime())) return false;
        
        if (currentBirthdayMonth === 'all') return true;
        const month = date.getMonth() + 1;
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
        if (!m.inducted) return false;
        const isTerminated = m.status && m.status.toLowerCase().includes('terminated');
        if (isTerminated) return false;
        
        const date = new Date(m.inducted);
        if (isNaN(date.getTime())) return false;
        
        if (currentAnniversaryMonth === 'all') return true;
        const month = date.getMonth() + 1;
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
        const nextYears = years + 1;

        return `
            <div class="celebration-card">
                <div class="celebration-icon">🎉</div>
                <div class="celebration-info">
                    <h4>${member.name}</h4>
                    <p>${monthName} ${inducted.getDate()} • ${nextYears} year${nextYears !== 1 ? 's' : ''} in RCUG</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderSummaryTable() {
    const tbody = document.getElementById('summaryBody');
    const activeMembers = memberData.filter(m => {
        const isTerminated = m.status && m.status.toLowerCase().includes('terminated');
        return !isTerminated;
    });

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
        .filter(m => {
            if (!m.dob) return false;
            const isTerminated = m.status && m.status.toLowerCase().includes('terminated');
            if (isTerminated) return false;
            const date = new Date(m.dob);
            if (isNaN(date.getTime())) return false;
            if (currentBirthdayMonth === 'all') return true;
            return date.getMonth() + 1 === parseInt(currentBirthdayMonth);
        })
        .map(m => {
            const dob = new Date(m.dob);
            return {
                Name: m.name,
                Month: monthNames[dob.getMonth() + 1],
                Day: dob.getDate(),
                'Turning Age': calculateAge(m.dob) + 1
            };
        })
        .sort((a, b) => {
            const monthOrder = monthNames.indexOf(a.Month) - monthNames.indexOf(b.Month);
            if (monthOrder !== 0) return monthOrder;
            return a.Day - b.Day;
        });

    const filename = `RCUG_Birthdays_${currentBirthdayMonth === 'all' ? 'All_Months' : monthNames[parseInt(currentBirthdayMonth)]}.csv`;
    downloadCSV(data, filename);
}

function exportAnniversaries() {
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    let data = memberData
        .filter(m => {
            if (!m.inducted) return false;
            const isTerminated = m.status && m.status.toLowerCase().includes('terminated');
            if (isTerminated) return false;
            const date = new Date(m.inducted);
            if (isNaN(date.getTime())) return false;
            if (currentAnniversaryMonth === 'all') return true;
            return date.getMonth() + 1 === parseInt(currentAnniversaryMonth);
        })
        .map(m => {
            const inducted = new Date(m.inducted);
            return {
                Name: m.name,
                Month: monthNames[inducted.getMonth() + 1],
                Day: inducted.getDate(),
                'Years in RCUG': calculateYearsInducted(m.inducted) + 1
            };
        })
        .sort((a, b) => {
            const monthOrder = monthNames.indexOf(a.Month) - monthNames.indexOf(b.Month);
            if (monthOrder !== 0) return monthOrder;
            return a.Day - b.Day;
        });

    const filename = `RCUG_Induction_Anniversaries_${currentAnniversaryMonth === 'all' ? 'All_Months' : monthNames[parseInt(currentAnniversaryMonth)]}.csv`;
    downloadCSV(data, filename);
}

function exportSummary() {
    const activeMembers = memberData.filter(m => {
        const isTerminated = m.status && m.status.toLowerCase().includes('terminated');
        return !isTerminated;
    });
    
    let data = activeMembers.map(m => ({
        Name: m.name,
        Committee: getCommittees(m.name).join('; ') || '-',
        'Business Meetings': `${m.businessMeetings}/${m.totalBusinessMeetings}`,
        'Fellowship Meetings': `${m.fellowshipMeetings}/${m.totalFellowshipMeetings}`,
        'Projects': `${m.projects}/${m.totalProjects}`,
        'Committee Meetings': m.committeeMeetings || 0,
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// INITIALIZE ON LOAD
// ============================================
document.addEventListener('DOMContentLoaded', init);
