export function renderAbout(app) {
  app.innerHTML = `
    <section class="page-hero about-hero">
      <div class="page-hero-overlay"></div>
      <div class="page-hero-content">
        <p class="eyebrow">Our Story</p>
        <h1 class="page-title">About Tiger</h1>
      </div>
    </section>

    <section class="about-section">
      <div class="about-grid">
        <div class="about-text">
          <h2>Established June 2026</h2>
          <p>
            Tiger Restaurant &amp; Bar is dedicated to redefining your dining experience through a
            perfect blend of exquisite flavors and impeccable service. We take pride in being a
            premier destination for those who appreciate the finer things in life, offering a
            sophisticated atmosphere where culinary excellence meets unparalleled hospitality.
          </p>
          <p>
            From signature roasted specialties to a curated bar of premium whiskies and beers,
            every detail is crafted to make your visit memorable.
          </p>
          <a href="/contact.html" class="btn btn-primary">Plan Your Visit</a>
        </div>
        <div class="about-media">
          <img src="/images/poster_about_page.jpg" alt="Tiger Restaurant ambiance" />
        </div>
      </div>
    </section>

    <section class="values">
      <div class="value-card">
        <h3>Culinary Excellence</h3>
        <p>Each dish is composed with premium ingredients and masterful technique.</p>
      </div>
      <div class="value-card">
        <h3>Impeccable Service</h3>
        <p>Attentive, warm hospitality from the moment you arrive.</p>
      </div>
      <div class="value-card">
        <h3>Sophisticated Atmosphere</h3>
        <p>A refined setting designed for memorable gatherings.</p>
      </div>
    </section>
  `;
}
