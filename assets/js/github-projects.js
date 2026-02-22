(function () {
  var statusEl = document.getElementById("github-projects-status");
  var listEl = document.getElementById("github-projects-list");
  if (!statusEl || !listEl) return;

  var username = "SamiSadat";
  var endpoint = "https://api.github.com/users/" + username + "/repos?sort=updated&per_page=100";
  var featuredRepos = new Set([
    "multimodal-rag-system",
    "multimodal-personal-knowledge-base",
    "document-ai-entity-extraction",
    "samisadat.github.io"
  ]);

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      return iso;
    }
  }

  function renderRepo(repo) {
    var topics = Array.isArray(repo.topics) ? repo.topics.slice(0, 4) : [];
    var language = repo.language ? "<li>" + escapeHtml(repo.language) + "</li>" : "";
    var topicTags = topics.map(function (topic) {
      return "<li>" + escapeHtml(topic) + "</li>";
    }).join("");
    var desc = repo.description || "No description added yet.";
    var homepageLink = repo.homepage
      ? '<a href="' + escapeHtml(repo.homepage) + '" target="_blank" rel="noopener noreferrer">Live</a>'
      : "";

    return (
      '<article class="github-repo-card">' +
        '<div class="repo-top">' +
          '<h3><a href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(repo.name) + "</a></h3>" +
          '<span class="repo-updated">Updated ' + escapeHtml(formatDate(repo.pushed_at)) + "</span>" +
        "</div>" +
        '<p class="repo-desc">' + escapeHtml(desc) + "</p>" +
        '<ul class="project-tags compact repo-tags">' + language + topicTags + "</ul>" +
        '<div class="repo-meta">' +
          '<span>Stars: ' + escapeHtml(repo.stargazers_count || 0) + "</span>" +
          (repo.fork ? "<span>Fork</span>" : "<span>Source</span>") +
        "</div>" +
        '<div class="repo-actions">' +
          '<a class="button small primary" href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener noreferrer">Repo</a>' +
          homepageLink +
        "</div>" +
      "</article>"
    );
  }

  fetch(endpoint, {
    headers: {
      "Accept": "application/vnd.github+json"
    }
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("GitHub API returned " + response.status);
      }
      return response.json();
    })
    .then(function (repos) {
      if (!Array.isArray(repos)) {
        throw new Error("Unexpected GitHub API response");
      }

      var visible = repos
        .filter(function (repo) { return !repo.archived; })
        .filter(function (repo) { return !featuredRepos.has(repo.name); })
        .sort(function (a, b) {
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        })
        .slice(0, 6);

      if (!visible.length) {
        statusEl.textContent = "No additional repositories found.";
        return;
      }

      listEl.innerHTML = visible.map(renderRepo).join("");
      statusEl.textContent = "Loaded latest repositories from GitHub.";
      statusEl.classList.add("is-success");
    })
    .catch(function (error) {
      statusEl.textContent = "Could not load GitHub projects automatically. Visit github.com/" + username + " to view the latest repositories.";
      statusEl.classList.add("is-error");
      listEl.innerHTML = "";
      if (window.console && console.error) console.error(error);
    });
})();
