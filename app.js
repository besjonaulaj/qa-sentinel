// 1. PROJECT CONFIG

const URL_DATA = 'https://oebehacnjfiebsirozfp.supabase.co'; 
const KEY_DATA = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lYmVoYWNuamZpZWJzaXJvemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzc2MDQsImV4cCI6MjA5MDYxMzYwNH0.qY077AP-_wP2-XLMhqmqIua_y4xJP1oKTlqk_Zaftx4';            

const connection = supabase.createClient(URL_DATA, KEY_DATA);

// 2. MODAL LOGIC
function openModal() { document.getElementById('modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

// 3. FETCH & RENDER
async function fetchTickets() {
    // We added .order() so the newest bugs appear at the top
    const { data, error } = await connection
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) { console.error('Fetch Error:', error); return; }
    
    const todo = document.querySelector('#todo .ticket-container');
    const progress = document.querySelector('#in-progress .ticket-container');
    const resolved = document.querySelector('#resolved .ticket-container');

    todo.innerHTML = ''; progress.innerHTML = ''; resolved.innerHTML = '';

    data.forEach(t => {
        let nextStatus = '';
        let buttonText = '';
        
        if (t.status === 'todo') {
            nextStatus = 'in-progress';
            buttonText = 'Start Working →';
        } else if (t.status === 'in-progress') {
            nextStatus = 'resolved';
            buttonText = 'Finish Ticket ✓';
        }

        // Format the date from Supabase
        const date = t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Just now';

        const card = `
            <div class="ticket-card ${t.priority ? t.priority.toLowerCase() : ''}">
                <h4>${t.title}</h4>
                <p>${t.description || ''}</p>
                <small>Priority: ${t.priority}</small>
                <span class="timestamp">Reported: ${date}</span>
                
                ${nextStatus ? 
                    `<button class="move-btn" onclick="updateStatus(${t.id}, '${nextStatus}')">${buttonText}</button>` : 
                    `<p class="done-tag">Complete!</p>
                     <button class="delete-btn" onclick="deleteTicket(${t.id})">Delete Archive</button>`
                }
            </div>`;
        
        if (t.status === 'todo') todo.innerHTML += card;
        else if (t.status === 'in-progress') progress.innerHTML += card;
        else if (t.status === 'resolved') resolved.innerHTML += card;
    });
}

// 4. UPDATE STATUS
async function updateStatus(ticketId, newStatus) {
    const { error } = await connection.from('tickets').update({ status: newStatus }).eq('id', ticketId);
    if (!error) fetchTickets();
}

// 5. DELETE TICKET
async function deleteTicket(ticketId) {
    if (confirm("Are you sure you want to delete this record permanently?")) {
        const { error } = await connection.from('tickets').delete().eq('id', ticketId);
        if (!error) fetchTickets();
    }
}

// 6. SUBMIT NEW
async function submitTicket() {
    const t_title = document.getElementById('ticket-title').value;
    const t_priority = document.getElementById('ticket-priority').value;
    const t_desc = document.getElementById('ticket-desc').value;

    if (!t_title) { alert("Title is required!"); return; }

    const { error } = await connection.from('tickets').insert([
        { title: t_title, priority: t_priority, description: t_desc, status: 'todo' }
    ]);

    if (!error) {
        closeModal();
        fetchTickets();
        document.getElementById('ticket-title').value = '';
        document.getElementById('ticket-desc').value = '';
    }
}

fetchTickets();