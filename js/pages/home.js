export function renderHome(app) {
  app.innerHTML = `
    <section class="hero" id="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-eyebrow">Established June 2026</p>
        <h1 class="hero-title">A Taste Worth<br>Roaring About</h1>
        <p class="hero-sub">Sophisticated flavors, impeccable service, and an atmosphere where culinary excellence meets unparalleled hospitality.</p>
        <div class="hero-actions">
          <a href="/menu.html" class="btn btn-primary">Explore the Menu</a>
          <a href="/contact.html" class="btn btn-ghost">Reserve a Table</a>
        </div>
      </div>
      <a href="#featured" class="scroll-hint" aria-label="Scroll down">
        <span></span>
      </a>
    </section>

    <section class="featured" id="featured">
      <div class="section-head">
        <p class="eyebrow">Signature Plates</p>
        <h2 class="section-title">Crafted to Impress</h2>
        <p class="section-lead">A glimpse of what's waiting on our menu — from premium seafood to our signature roasted specialties.</p>
      </div>
      <div class="feature-grid">
        <article class="feature-card">
          <img src="/images/roasted_peking_duck.jpg" alt="Roasted whole Peking duck" loading="lazy" />
          <div class="feature-body">
            <h3>Roasted Peking Duck</h3>
            <p>Signature whole duck with our premium house-made sauce.</p>
          </div>
        </article>
        <article class="feature-card">
          <img src="/images/grilled_lobster.jpg" alt="Grilled Boston lobster" loading="lazy" />
          <div class="feature-body">
            <h3>Grilled Boston Lobster</h3>
            <p>Garlic herb butter sauce with a lemon finish.</p>
          </div>
        </article>
        <article class="feature-card">
          <img src="/images/beef_steak.jpg" alt="Australian beef steak" loading="lazy" />
          <div class="feature-body">
            <h3>Australian Beef Steak</h3>
            <p>Premium cut with our house-made BBQ sauces.</p>
          </div>
        </article>
      </div>
      <div class="feature-cta">
        <a href="/menu.html" class="btn btn-outline">View Full Menu</a>
      </div>
    </section>

    <section class="strip">
      <div class="strip-item">
        <span class="strip-num">01</span>
        <h3>Fresh Ingredients</h3>
        <p>Sourced daily for peak flavor and quality.</p>
      </div>
      <div class="strip-item">
        <span class="strip-num">02</span>
        <h3>Master Chefs</h3>
        <p>Skilled hands behind every signature dish.</p>
      </div>
      <div class="strip-item">
        <span class="strip-num">03</span>
        <h3>Refined Atmosphere</h3>
        <p>A sophisticated setting for memorable moments.</p>
      </div>
    </section>
  `;
}
