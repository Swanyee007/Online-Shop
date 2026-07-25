export async function renderContact(app, ctx) {
  app.innerHTML = `
    <section class="page-hero contact-hero">
      <div class="page-hero-overlay"></div>
      <div class="page-hero-content">
        <p class="eyebrow">Book Your Table</p>
        <h1 class="page-title">Reserve a Table</h1>
        <p class="page-lead">Tell us when you're coming — we'll take care of the rest.</p>
      </div>
    </section>

    <section class="contact-section">
      <div class="contact-grid">
        <aside class="contact-info">
          <h2>Get in Touch</h2>
          <p>Prefer to reach us directly? We're here for you.</p>
          <ul class="info-list">
            <li>
              <span class="info-label">Email</span>
              <a href="mailto:tiger_restaurant_&_bar@gmail.com">tiger_restaurant_&amp;_bar@gmail.com</a>
            </li>
            <li>
              <span class="info-label">Phone</span>
              <a href="tel:+959543675843">+95 954 367 5843</a>
            </li>
            <li>
              <span class="info-label">Hours</span>
              <span>Mon – Thu · 11:00 – 23:00</span>
              <span>Fri – Sun · 11:00 – 01:00</span>
            </li>
          </ul>
        </aside>

        <form class="reserve-form" id="reserveForm" novalidate>
          <div class="form-row">
            <div class="field">
              <label for="firstName">First Name</label>
              <input type="text" id="firstName" name="firstName" maxlength="20" placeholder="Enter first name" required />
            </div>
            <div class="field">
              <label for="lastName">Last Name</label>
              <input type="text" id="lastName" name="lastName" maxlength="20" placeholder="Enter last name" required />
            </div>
          </div>

          <div class="field">
            <label for="reserveAt">Date &amp; Time</label>
            <input type="datetime-local" id="reserveAt" name="reserveAt" required />
          </div>

          <div class="form-row">
            <div class="field">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" maxlength="50" placeholder="you@example.com" required />
            </div>
            <div class="field">
              <label for="phone">Phone</label>
              <input type="tel" id="phone" name="phone" maxlength="20" placeholder="Enter phone" required />
            </div>
          </div>

          <label class="check">
            <input type="checkbox" id="terms" name="terms" required />
            <span>I agree to the Terms of Use</span>
          </label>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="submitBtn">Confirm Reservation</button>
            <button type="reset" class="btn btn-ghost">Clear</button>
          </div>

          <p class="form-note" id="formNote" role="status" hidden></p>
        </form>
      </div>
    </section>
  `;

  const { supabase, showToast } = ctx;
  const form = document.getElementById('reserveForm');
  const note = document.getElementById('formNote');
  const submitBtn = document.getElementById('submitBtn');

  // default datetime to next hour
  const now = new Date();
  now.setHours(now.getHours() + 1, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  const min = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  document.getElementById('reserveAt').value = min;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    note.hidden = true;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {
      first_name: form.firstName.value.trim(),
      last_name: form.lastName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      reserve_at: new Date(form.reserveAt.value).toISOString(),
      agreed_terms: form.terms.checked,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const { error } = await supabase.from('reservations').insert(data);
      if (error) throw error;
      showToast('Reservation received! We will confirm shortly.', 'success');
      form.reset();
      document.getElementById('reserveAt').value = min;
    } catch (err) {
      console.error(err);
      note.hidden = false;
      note.textContent = 'Could not submit your reservation. Please try again or call us.';
      note.className = 'form-note error';
      showToast('Submission failed. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Reservation';
    }
  });
}
