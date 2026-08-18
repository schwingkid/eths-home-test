(()=>{
  const items = Array.isArray(window.YTC_NEWS) ? window.YTC_NEWS : [];

  document.querySelectorAll("[data-news-feed]").forEach(feed => {
    const limit = Number(feed.dataset.newsLimit || items.length);
    const skip = (feed.dataset.newsSkip || "").split(",").map(value => value.trim()).filter(Boolean);
    const selected = items.filter(item => !skip.includes(item.slug)).slice(0, limit);

    selected.forEach(item => {
      const article = document.createElement("article");
      article.className = "news-card";
      article.innerHTML = `
        <a class="news-card-image" href="${item.href}">
          <img src="${item.image}" alt="${item.alt}">
        </a>
        <div class="news-card-body">
          <div class="news-card-meta"><span>${item.category}</span><time datetime="${item.date}">${item.displayDate}</time></div>
          <h3><a href="${item.href}">${item.title}</a></h3>
          <p>${item.summary}</p>
          <a class="news-card-link" href="${item.href}">Read the story →</a>
        </div>`;
      feed.appendChild(article);
    });
  });
})();
