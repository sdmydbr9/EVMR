// Global variables
let authToken = localStorage.getItem('adminToken');
let currentUserId = null;
let currentView = 'dashboard';
let counts = {
    pending: 0,
    approved: 0,
    rejected: 0
};

// DOM elements - Login
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

// DOM elements - Dashboard
const refreshBtn = document.getElementById('refresh-btn');
const currentViewTitle = document.getElementById('current-view-title');
const menuItems = document.querySelectorAll('.menu-item');

// DOM elements - Registration counts
const pendingCountEl = document.getElementById('pending-count');
const approvedCountEl = document.getElementById('approved-count');
const rejectedCountEl = document.getElementById('rejected-count');

// DOM elements - Recent registrations
const recentLoading = document.getElementById('recent-loading');
const recentEmpty = document.getElementById('recent-empty');
const recentTableContainer = document.getElementById('recent-table-container');
const recentTable = document.getElementById('recent-table');

// DOM elements - Pending registrations
const pendingLoading = document.getElementById('pending-loading');
const pendingEmpty = document.getElementById('pending-empty');
const pendingTableContainer = document.getElementById('pending-table-container');
const pendingTable = document.getElementById('pending-table');

// DOM elements - Approved registrations
const approvedLoading = document.getElementById('approved-loading');
const approvedEmpty = document.getElementById('approved-empty');
const approvedTableContainer = document.getElementById('approved-table-container');
const approvedTable = document.getElementById('approved-table');

// DOM elements - Rejected registrations
const rejectedLoading = document.getElementById('rejected-loading');
const rejectedEmpty = document.getElementById('rejected-empty');
const rejectedTableContainer = document.getElementById('rejected-table-container');
const rejectedTable = document.getElementById('rejected-table');

// DOM elements - Registration modal
const modalLoading = document.getElementById('modal-loading');
const registrationDetails = document.getElementById('registration-details');
const approveBtn = document.getElementById('approve-btn');
const rejectBtn = document.getElementById('reject-btn');
const confirmRejectBtn = document.getElementById('confirm-reject-btn');
const rejectionReason = document.getElementById('rejection-reason');

// Bootstrap modals
let registrationModal;
let rejectionModal;

try {
    const registrationModalEl = document.getElementById('registration-modal');
    const rejectionModalEl = document.getElementById('rejection-modal');
    
    if (registrationModalEl) {
        registrationModal = new bootstrap.Modal(registrationModalEl);
        console.log('Registration modal initialized');
    } else {
        console.error('Registration modal element not found');
    }
    
    if (rejectionModalEl) {
        rejectionModal = new bootstrap.Modal(rejectionModalEl);
        console.log('Rejection modal initialized');
    } else {
        console.error('Rejection modal element not found');
    }
} catch (error) {
    console.error('Error initializing modals:', error);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth();

    // Add event listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    refreshBtn.addEventListener('click', refreshData);
    
    // Menu navigation
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.id === 'logout-btn') return; // Skip for logout button
            e.preventDefault();
            const view = item.getAttribute('data-view');
            if (view) {
                navigateTo(view);
            }
        });
    });

    // Modal handlers
    approveBtn.addEventListener('click', handleApprove);
    rejectBtn.addEventListener('click', handleReject);
    confirmRejectBtn.addEventListener('click', handleConfirmReject);
});

// Check if user is authenticated
function checkAuth() {
    console.log('Checking authentication, token:', !!authToken);
    
    if (authToken) {
        console.log('User is authenticated, showing dashboard');
        toggleView(loginContainer, dashboardContainer);
        loadDashboard();
    } else {
        console.log('User is not authenticated, showing login');
        toggleView(dashboardContainer, loginContainer);
    }
}

// Helper function to toggle between views
function toggleView(hideElement, showElement) {
    if (hideElement) {
        hideElement.style.display = 'none';
        hideElement.classList.add('hidden');
    }
    
    if (showElement) {
        showElement.style.display = '';
        showElement.classList.remove('hidden');
        
        // Force browser reflow to ensure changes take effect
        void showElement.offsetHeight;
        
        console.log(`Toggled view: ${hideElement?.id} hidden, ${showElement?.id} shown`);
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    loginError.classList.add('hidden');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        console.log('Attempting login with email:', email);
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        console.log('Login response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Login successful, received token');
            
            // Store the token
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            
            // Show success notification
            showToast('Login successful', 'success');
            
            // Explicit transition to dashboard
            console.log('Starting transition to dashboard');
            toggleView(loginContainer, dashboardContainer);
            
            // Initialize dashboard
            setTimeout(() => {
                loadDashboard();
            }, 100);
        } else {
            console.error('Login failed:', response.status);
            loginError.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.classList.remove('hidden');
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    authToken = null;
    checkAuth();
    showToast('You have been logged out', 'info');
}

// Load dashboard data
function loadDashboard() {
    // Set dashboard as active view
    currentView = 'dashboard';
    updateActiveMenu();
    
    // Load counts and data
    loadCounts();
    loadPendingRegistrations();
    loadApprovedRegistrations();
    loadRejectedRegistrations();
    loadRecentRegistrations();
}

// Navigate to a specific view
function navigateTo(view) {
    currentView = view;
    updateActiveMenu();
    
    // Hide all views
    document.querySelectorAll('.view-content').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Show selected view
    const viewElement = document.getElementById(`view-${view}`);
    if (viewElement) {
        viewElement.classList.remove('hidden');
        
        // Update header title
        const titleMap = {
            'dashboard': 'Dashboard',
            'pending': 'Pending Registrations',
            'approved': 'Approved Registrations',
            'rejected': 'Rejected Registrations',
            'users': 'Users',
            'settings': 'Settings'
        };
        
        currentViewTitle.textContent = titleMap[view] || 'Dashboard';
        
        // Load data for this view if needed
        switch(view) {
            case 'dashboard':
                loadCounts();
                loadRecentRegistrations();
                break;
            case 'pending':
                loadPendingRegistrations();
                break;
            case 'approved':
                loadApprovedRegistrations();
                break;
            case 'rejected':
                loadRejectedRegistrations();
                break;
        }
    }
}

// Update active menu item
function updateActiveMenu() {
    menuItems.forEach(item => {
        const view = item.getAttribute('data-view');
        if (view === currentView) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Refresh all data
function refreshData() {
    showToast('Refreshing data...', 'info');
    
    switch(currentView) {
        case 'dashboard':
            loadCounts();
            loadRecentRegistrations();
            break;
        case 'pending':
            loadPendingRegistrations();
            break;
        case 'approved':
            loadApprovedRegistrations();
            break;
        case 'rejected':
            loadRejectedRegistrations();
            break;
        default:
            loadDashboard();
    }
}

// Load registration counts
async function loadCounts() {
    try {
        // Load pending registrations count
        const pendingResponse = await fetch('/api/admin/approvals/pending', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (pendingResponse.ok) {
            const pendingData = await pendingResponse.json();
            counts.pending = pendingData.count || 0;
            pendingCountEl.textContent = counts.pending;
        }

        // Load approved registrations count
        const approvedResponse = await fetch('/api/admin/approvals/approved', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (approvedResponse.ok) {
            const approvedData = await approvedResponse.json();
            counts.approved = approvedData.count || 0;
            approvedCountEl.textContent = counts.approved;
        }
        
        // Load rejected registrations count
        const rejectedResponse = await fetch('/api/admin/approvals/rejected', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (rejectedResponse.ok) {
            const rejectedData = await rejectedResponse.json();
            counts.rejected = rejectedData.count || 0;
            rejectedCountEl.textContent = counts.rejected;
        }
        
    } catch (error) {
        console.error('Error loading counts:', error);
        showToast('Error loading registration counts', 'danger');
    }
}

// Load recent registrations
async function loadRecentRegistrations() {
    recentLoading.classList.remove('hidden');
    recentTableContainer.classList.add('hidden');
    recentEmpty.classList.add('hidden');
    
    try {
        const response = await fetch('/api/admin/approvals/pending', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.pendingUsers && data.pendingUsers.length > 0) {
                // Show only the 5 most recent registrations
                const recentRegistrations = data.pendingUsers.slice(0, 5);
                renderRecentRegistrationsTable(recentRegistrations);
                recentTableContainer.classList.remove('hidden');
            } else {
                recentEmpty.classList.remove('hidden');
            }
        } else if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('adminToken');
            authToken = null;
            checkAuth();
        }
    } catch (error) {
        console.error('Error loading recent registrations:', error);
        showToast('Error loading recent registrations', 'danger');
        recentEmpty.classList.remove('hidden');
    } finally {
        recentLoading.classList.add('hidden');
    }
}

// Load pending registrations
async function loadPendingRegistrations() {
    pendingLoading.classList.remove('hidden');
    pendingTableContainer.classList.add('hidden');
    pendingEmpty.classList.add('hidden');
    
    try {
        const response = await fetch('/api/admin/approvals/pending', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.pendingUsers && data.pendingUsers.length > 0) {
                renderPendingRegistrationsTable(data.pendingUsers);
                pendingTableContainer.classList.remove('hidden');
            } else {
                pendingEmpty.classList.remove('hidden');
            }
        } else if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('adminToken');
            authToken = null;
            checkAuth();
        }
    } catch (error) {
        console.error('Error loading pending registrations:', error);
        showToast('Error loading pending registrations', 'danger');
        pendingEmpty.classList.remove('hidden');
    } finally {
        pendingLoading.classList.add('hidden');
    }
}

// Load approved registrations
async function loadApprovedRegistrations() {
    approvedLoading.classList.remove('hidden');
    approvedTableContainer.classList.add('hidden');
    approvedEmpty.classList.add('hidden');
    
    try {
        const response = await fetch('/api/admin/approvals/approved', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.approvedUsers && data.approvedUsers.length > 0) {
                renderApprovedRegistrationsTable(data.approvedUsers);
                approvedTableContainer.classList.remove('hidden');
            } else {
                approvedEmpty.classList.remove('hidden');
            }
        } else if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('adminToken');
            authToken = null;
            checkAuth();
        }
    } catch (error) {
        console.error('Error loading approved registrations:', error);
        showToast('Error loading approved registrations', 'danger');
        approvedEmpty.classList.remove('hidden');
    } finally {
        approvedLoading.classList.add('hidden');
    }
}

// Load rejected registrations
async function loadRejectedRegistrations() {
    rejectedLoading.classList.remove('hidden');
    rejectedTableContainer.classList.add('hidden');
    rejectedEmpty.classList.add('hidden');
    
    try {
        const response = await fetch('/api/admin/approvals/rejected', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.rejectedUsers && data.rejectedUsers.length > 0) {
                renderRejectedRegistrationsTable(data.rejectedUsers);
                rejectedTableContainer.classList.remove('hidden');
            } else {
                rejectedEmpty.classList.remove('hidden');
            }
        } else if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('adminToken');
            authToken = null;
            checkAuth();
        }
    } catch (error) {
        console.error('Error loading rejected registrations:', error);
        showToast('Error loading rejected registrations', 'danger');
        rejectedEmpty.classList.remove('hidden');
    } finally {
        rejectedLoading.classList.add('hidden');
    }
}

// Render recent registrations table
function renderRecentRegistrationsTable(registrations) {
    recentTable.innerHTML = '';
    
    registrations.forEach(reg => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(reg.created_at);
        const formattedDate = formatDate(date);
        
        // Determine badge class based on status
        const statusClass = reg.status === 'pending' ? 'badge-pending' : 
                            reg.status === 'approved' ? 'badge-approved' : 'badge-rejected';
        
        row.innerHTML = `
            <td>${reg.name || reg.user_data?.fullName || 'N/A'}</td>
            <td>${reg.email || reg.user_data?.email || 'N/A'}</td>
            <td>${formatRole(reg.role || reg.user_data?.role)}</td>
            <td><span class="badge badge-pending">Pending</span></td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-sm btn-primary view-details" data-id="${reg.id}">
                    <i class="bi bi-eye"></i> View
                </button>
            </td>
        `;
        
        recentTable.appendChild(row);
    });
    
    // Add event listeners to view details buttons
    document.querySelectorAll('#recent-table .view-details').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            viewRegistrationDetails(id);
        });
    });
}

// Render pending registrations table
function renderPendingRegistrationsTable(registrations) {
    pendingTable.innerHTML = '';
    
    registrations.forEach(reg => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(reg.created_at);
        const formattedDate = formatDate(date);
        
        row.innerHTML = `
            <td>${reg.name || reg.user_data?.fullName || 'N/A'}</td>
            <td>${reg.email || reg.user_data?.email || 'N/A'}</td>
            <td>${formatRole(reg.role || reg.user_data?.role)}</td>
            <td>${reg.clinic_name || reg.user_data?.clinicName || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-primary view-details" data-id="${reg.id}">
                        <i class="bi bi-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-success approve-btn" data-id="${reg.id}">
                        <i class="bi bi-check-lg"></i> Approve
                    </button>
                    <button class="btn btn-sm btn-danger reject-btn" data-id="${reg.id}">
                        <i class="bi bi-x-lg"></i> Reject
                    </button>
                </div>
            </td>
        `;
        
        pendingTable.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('#pending-table .view-details').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            viewRegistrationDetails(id);
        });
    });
    
    document.querySelectorAll('#pending-table .approve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            approveRegistration(id);
        });
    });
    
    document.querySelectorAll('#pending-table .reject-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            openRejectionModal(id);
        });
    });
}

// Render approved registrations table
function renderApprovedRegistrationsTable(registrations) {
    approvedTable.innerHTML = '';
    
    registrations.forEach(reg => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(reg.approved_at || reg.updated_at || reg.created_at);
        const formattedDate = formatDate(date);
        
        row.innerHTML = `
            <td>${reg.name || reg.user_data?.fullName || 'N/A'}</td>
            <td>${reg.email || reg.user_data?.email || 'N/A'}</td>
            <td>${formatRole(reg.role || reg.user_data?.role)}</td>
            <td>${reg.clinic_name || reg.user_data?.clinicName || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-sm btn-primary view-details" data-id="${reg.id}">
                    <i class="bi bi-eye"></i> View
                </button>
            </td>
        `;
        
        approvedTable.appendChild(row);
    });
    
    // Add event listeners to view details buttons
    document.querySelectorAll('#approved-table .view-details').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            viewRegistrationDetails(id);
        });
    });
}

// Render rejected registrations table
function renderRejectedRegistrationsTable(registrations) {
    rejectedTable.innerHTML = '';
    
    registrations.forEach(reg => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(reg.rejected_at || reg.updated_at || reg.created_at);
        const formattedDate = formatDate(date);
        
        // Get rejection reason from details
        let rejectionReason = 'No reason provided';
        if (reg.details && typeof reg.details === 'object') {
            rejectionReason = reg.details.rejection_reason || 'No reason provided';
        } else if (typeof reg.details === 'string') {
            try {
                const details = JSON.parse(reg.details);
                rejectionReason = details.rejection_reason || 'No reason provided';
            } catch (e) {
                // Use default
            }
        }
        
        row.innerHTML = `
            <td>${reg.name || reg.user_data?.fullName || 'N/A'}</td>
            <td>${reg.email || reg.user_data?.email || 'N/A'}</td>
            <td>${formatRole(reg.role || reg.user_data?.role)}</td>
            <td>${reg.clinic_name || reg.user_data?.clinicName || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>${rejectionReason}</td>
            <td>
                <button class="btn btn-sm btn-primary view-details" data-id="${reg.id}">
                    <i class="bi bi-eye"></i> View
                </button>
            </td>
        `;
        
        rejectedTable.appendChild(row);
    });
    
    // Add event listeners to view details buttons
    document.querySelectorAll('#rejected-table .view-details').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            viewRegistrationDetails(id);
        });
    });
}

// View registration details
async function viewRegistrationDetails(id) {
    // Reset modal content
    document.getElementById('detail-name').textContent = '-';
    document.getElementById('detail-email').textContent = '-';
    document.getElementById('detail-phone').textContent = '-';
    document.getElementById('detail-role').textContent = '-';
    document.getElementById('detail-status').textContent = 'Pending';
    document.getElementById('detail-created-at').textContent = '-';
    document.getElementById('detail-clinic-name').textContent = '-';
    document.getElementById('detail-clinic-email').textContent = '-';
    document.getElementById('detail-clinic-address').textContent = '-';
    document.getElementById('detail-clinic-phone').textContent = '-';
    document.getElementById('detail-json').textContent = '';
    
    // Show loading and hide details
    modalLoading.classList.remove('hidden');
    registrationDetails.classList.add('hidden');
    
    // Store current user ID for approval/rejection
    currentUserId = id;
    approveBtn.setAttribute('data-id', id);
    rejectBtn.setAttribute('data-id', id);
    
    // Show modal
    registrationModal.show();
    
    try {
        const response = await fetch(`/api/admin/approvals/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const reg = data.registration;
            
            // If we have user_data field, use it; otherwise use the registration directly
            const userData = reg.user_data || reg;
            
            // Populate basic info
            document.getElementById('detail-name').textContent = userData.fullName || userData.name || 'N/A';
            document.getElementById('detail-email').textContent = userData.email || 'N/A';
            document.getElementById('detail-phone').textContent = userData.phone || 'N/A';
            document.getElementById('detail-role').textContent = formatRole(userData.role);
            document.getElementById('detail-status').textContent = userData.status || 'Pending';
            document.getElementById('detail-created-at').textContent = formatDate(new Date(reg.created_at));
            
            // Clinic info
            document.getElementById('detail-clinic-name').textContent = userData.clinicName || userData.clinic_name || 'N/A';
            document.getElementById('detail-clinic-email').textContent = userData.clinicEmail || userData.clinic_email || 'N/A';
            document.getElementById('detail-clinic-address').textContent = userData.clinicAddress || userData.clinic_address || 'N/A';
            document.getElementById('detail-clinic-phone').textContent = userData.clinicPhone || userData.clinic_phone || 'N/A';
            
            // Additional details as JSON
            document.getElementById('detail-json').textContent = JSON.stringify(userData, null, 2);
            
            // Update status badge class
            const statusBadge = document.getElementById('detail-status');
            statusBadge.className = 'badge';
            if (userData.status === 'approved') {
                statusBadge.classList.add('badge-approved');
                // Hide action buttons for approved registrations
                approveBtn.classList.add('hidden');
                rejectBtn.classList.add('hidden');
            } else if (userData.status === 'rejected') {
                statusBadge.classList.add('badge-rejected');
                // Hide action buttons for rejected registrations
                approveBtn.classList.add('hidden');
                rejectBtn.classList.add('hidden');
            } else {
                statusBadge.classList.add('badge-pending');
                // Show action buttons for pending registrations
                approveBtn.classList.remove('hidden');
                rejectBtn.classList.remove('hidden');
            }
            
            // Show details and hide loading
            modalLoading.classList.add('hidden');
            registrationDetails.classList.remove('hidden');
        } else {
            showToast('Error loading registration details', 'danger');
            registrationModal.hide();
        }
    } catch (error) {
        console.error('Error loading registration details:', error);
        showToast('Error loading registration details', 'danger');
        registrationModal.hide();
    }
}

// Handle approval button click
function handleApprove() {
    const id = approveBtn.getAttribute('data-id');
    approveRegistration(id);
}

// Approve registration
async function approveRegistration(id) {
    try {
        const response = await fetch(`/api/admin/approvals/${id}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showToast('Registration approved successfully!', 'success');
            
            // Close modal if it's open
            if (currentUserId === id) {
                registrationModal.hide();
            }
            
            // Refresh data
            refreshData();
        } else {
            showToast('Error approving registration', 'danger');
        }
    } catch (error) {
        console.error('Error approving registration:', error);
        showToast('Error approving registration', 'danger');
    }
}

// Handle reject button click
function handleReject() {
    const id = rejectBtn.getAttribute('data-id');
    openRejectionModal(id);
}

// Open rejection modal
function openRejectionModal(id) {
    // Store ID for confirmation
    confirmRejectBtn.setAttribute('data-id', id);
    
    // Clear previous reason
    rejectionReason.value = '';
    
    // Hide registration modal if it's open
    if (currentUserId === id) {
        registrationModal.hide();
    }
    
    // Show rejection modal
    rejectionModal.show();
}

// Handle confirm reject button click
function handleConfirmReject() {
    const id = confirmRejectBtn.getAttribute('data-id');
    const reason = rejectionReason.value.trim();
    
    if (!reason) {
        alert('Please provide a rejection reason');
        return;
    }
    
    rejectRegistration(id, reason);
}

// Reject registration
async function rejectRegistration(id, reason) {
    try {
        const response = await fetch(`/api/admin/approvals/${id}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        
        if (response.ok) {
            showToast('Registration rejected successfully', 'success');
            
            // Close rejection modal
            rejectionModal.hide();
            
            // Refresh data
            refreshData();
        } else {
            showToast('Error rejecting registration', 'danger');
        }
    } catch (error) {
        console.error('Error rejecting registration:', error);
        showToast('Error rejecting registration', 'danger');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Set icon based on type
    let icon;
    switch(type) {
        case 'success':
            icon = '<i class="bi bi-check-circle-fill text-success"></i>';
            break;
        case 'danger':
            icon = '<i class="bi bi-exclamation-circle-fill text-danger"></i>';
            break;
        case 'warning':
            icon = '<i class="bi bi-exclamation-triangle-fill text-warning"></i>';
            break;
        default:
            icon = '<i class="bi bi-info-circle-fill text-primary"></i>';
    }
    
    toast.innerHTML = `
        <div class="toast-header">
            ${icon}
            <strong class="me-auto ms-2">PetSphere Admin</strong>
            <small>Just now</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 5000);
}

// Helper function to format date
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to format role
function formatRole(role) {
    if (!role) return 'N/A';
    
    switch(role.toLowerCase()) {
        case 'admin':
            return 'Institute Admin';
        case 'veterinarian':
            return 'Veterinarian';
        case 'client':
            return 'Pet Parent';
        default:
            return role.charAt(0).toUpperCase() + role.slice(1);
    }
} 