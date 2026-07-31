(function () {
  var mobileNav = document.getElementById("navigation-mobile");
  var opener = document.querySelector(".menu-mobile-opener");

  if (!mobileNav || !opener) {
    return;
  }

  opener.addEventListener("click", function () {
    var expanded = mobileNav.classList.toggle("show");
    opener.setAttribute("aria-expanded", expanded ? "true" : "false");
  });
}());

(function () {
  var apiBase = "https://www.jereriikonen.fi/wp-json/wp/v2";
  var pageContent = document.querySelector("[data-wp-page-id]");
  var postList = document.querySelector("[data-wp-post-list]");

  function formatDate(value) {
    var date = new Date(value);
    return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
  }

  function stripParagraph(html) {
    var template = document.createElement("template");
    template.innerHTML = html || "";
    return template.content.textContent.trim();
  }

  if (pageContent) {
    fetch(apiBase + "/pages/" + pageContent.dataset.wpPageId + "?_fields=content")
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (data) {
        if (data && data.content && data.content.rendered) {
          pageContent.innerHTML = data.content.rendered;
        }
      })
      .catch(function () {});
  }

  if (postList) {
    Promise.all([
      fetch(apiBase + "/posts?per_page=10&_fields=date,link,title,excerpt,categories").then(function (response) { return response.json(); }),
      fetch(apiBase + "/categories?per_page=100&_fields=id,name").then(function (response) { return response.json(); })
    ]).then(function (results) {
      var posts = results[0];
      var categories = results[1].reduce(function (map, category) {
        map[category.id] = category.name;
        return map;
      }, {});
      var oldArticles = postList.querySelectorAll(".article-list-item");
      oldArticles.forEach(function (article) { article.remove(); });
      var nav = postList.querySelector("#nav-below");

      posts.forEach(function (post) {
        var article = document.createElement("article");
        var category = categories[post.categories[0]] || "Uutiset";
        article.className = "article-list-item";
        article.innerHTML =
          '<header class="entry-header">' +
            '<h1 class="entry-title"><a href="' + post.link + '">' + post.title.rendered + '</a></h1>' +
            '<div class="entry-meta"><ul class="post-categories"><li><a href="https://www.jereriikonen.fi/category/' + category.toLowerCase() + '/">' + category + '</a></li></ul> ' +
            '<a href="' + post.link + '"><time datetime="' + post.date + '">' + formatDate(post.date) + '</time></a></div>' +
          '</header>' +
          '<div class="entry-content"><p>' + stripParagraph(post.excerpt.rendered) + '</p></div>';
        postList.insertBefore(article, nav);
      });
    }).catch(function () {});
  }
}());
