const canvas = document.getElementById('grain');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.ceil(rect.width * dpr);
    canvas.height = Math.ceil(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeCanvas);
    window.visualViewport.addEventListener('scroll', resizeCanvas);
}

function drawGrain() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const buffer = new Uint32Array(imageData.data.buffer);
    
    const len = buffer.length;
    for (let i = 0; i < len; i++) {
        if (Math.random() > 0.95) {
            const gray = Math.random() * 100;
            buffer[i] = (255 << 24) | (gray << 16) | (gray << 8) | gray;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function animate() {
    drawGrain();
    requestAnimationFrame(animate);
}

animate();

const form = document.getElementById('waitlist-form');
const phoneInput = document.getElementById('phone');
const successMessage = document.getElementById('success-message');

function formatPhoneNumber(value) {
    let cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 0) return '';
    if (cleaned.length === 1) return `+${cleaned}`;
    
    // Auto-detect US number (10 digits starting with 2-9) and prepend 1
    if (cleaned.length === 10 && /^[2-9]/.test(cleaned)) {
        cleaned = '1' + cleaned;
    }
    
    // US/Canada (+1)
    if (cleaned.startsWith('1') && cleaned.length <= 11) {
        if (cleaned.length <= 4) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`;
        if (cleaned.length <= 7) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
        return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    
    // UK (+44)
    if (cleaned.startsWith('44')) {
        if (cleaned.length <= 2) return `+${cleaned}`;
        if (cleaned.length <= 6) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        if (cleaned.length <= 10) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6, 10)}`;
    }
    
    // Germany (+49)
    if (cleaned.startsWith('49')) {
        if (cleaned.length <= 2) return `+${cleaned}`;
        if (cleaned.length <= 5) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        if (cleaned.length <= 9) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9, 13)}`;
    }
    
    // France (+33)
    if (cleaned.startsWith('33')) {
        if (cleaned.length <= 2) return `+${cleaned}`;
        if (cleaned.length <= 3) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
    }
    
    // Australia (+61)
    if (cleaned.startsWith('61')) {
        if (cleaned.length <= 2) return `+${cleaned}`;
        if (cleaned.length <= 3) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        if (cleaned.length <= 7) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3)}`;
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7, 11)}`;
    }
    
    // Spain (+34), Italy (+39), Netherlands (+31), Belgium (+32)
    if (cleaned.startsWith('34') || cleaned.startsWith('39') || cleaned.startsWith('31') || cleaned.startsWith('32')) {
        if (cleaned.length <= 2) return `+${cleaned}`;
        if (cleaned.length <= 5) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        if (cleaned.length <= 8) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 11)}`;
    }
    
    // Mexico (+52), Brazil (+55)
    if (cleaned.startsWith('52') || cleaned.startsWith('55')) {
        if (cleaned.length <= 2) return `+${cleaned}`;
        if (cleaned.length <= 4) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        if (cleaned.length <= 8) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`;
    }
    
    // Generic international format for others (1-3 digit country code)
    if (cleaned.length <= 3) return `+${cleaned}`;
    if (cleaned.length <= 6) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9, 14)}`;
}

phoneInput.addEventListener('input', (e) => {
    const cursorPosition = e.target.selectionStart;
    const oldLength = e.target.value.length;
    const formatted = formatPhoneNumber(e.target.value);
    
    e.target.value = formatted;
    
    const newLength = formatted.length;
    const diff = newLength - oldLength;
    e.target.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = phoneInput.value.trim();
    
    if (!phone) return;
    
    try {
        await submitPhone(phone);
        
        form.style.display = 'none';
        successMessage.classList.add('show');
        
        phoneInput.value = '';
    } catch (error) {
        console.error('Error submitting phone:', error);
        alert('Something went wrong. Please try again.');
    }
});

const SUPABASE_URL = 'https://zuyyvnfjpimnkfgbwlqa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eXl2bmZqcGltbmtmZ2J3bHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NTM1OTgsImV4cCI6MjA3NTAyOTU5OH0.F4gx_e8hqfYhqMOd8zNgktLL-aNVz-qdBmrFSBRjp3s';

async function submitPhone(phone) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ phone })
    });
    
    if (!response.ok) {
        throw new Error('Failed to submit phone');
    }
}
