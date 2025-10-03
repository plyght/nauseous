const canvas = document.getElementById('grain');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

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
const emailInput = document.getElementById('email');
const successMessage = document.getElementById('success-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email) return;
    
    try {
        await submitEmail(email);
        
        form.style.display = 'none';
        successMessage.classList.add('show');
        
        emailInput.value = '';
    } catch (error) {
        console.error('Error submitting email:', error);
        alert('Something went wrong. Please try again.');
    }
});

const SUPABASE_URL = 'https://zuyyvnfjpimnkfgbwlqa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eXl2bmZqcGltbmtmZ2J3bHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NTM1OTgsImV4cCI6MjA3NTAyOTU5OH0.F4gx_e8hqfYhqMOd8zNgktLL-aNVz-qdBmrFSBRjp3s';

async function submitEmail(email) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
        throw new Error('Failed to submit email');
    }
}
