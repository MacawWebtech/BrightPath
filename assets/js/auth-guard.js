/* ============================================================
   BRIGHTPATH ACADEMY — Dashboard Auth Guard
   Loaded in <head> of every dashboard page. If the visitor has
   not signed in , send them
   to the login page instead of showing the dashboard.
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'brightpath-auth';

  function readAuth() {
    var raw = null;
    try { raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY); } catch (e) {}
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function clearAuth() {
    try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {}
  }

  var path = window.location.pathname;
  var needed = path.indexOf('/parent-dashboard/') !== -1 ? 'parent' : null;

  if (needed) {
    var auth = readAuth();
    if (!auth || auth.role !== needed) {
      window.location.replace('../pages/login.html');
    }
  }

  // Logout links clear the session before navigating to the login page
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href$="login.html"]');
    if (link && link.closest('.dashboard-sidebar')) clearAuth();
  });
})();
