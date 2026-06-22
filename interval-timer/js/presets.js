/* =====================================================================
 *  presets.js — Sauvegarde / chargement de préréglages nommés
 *  dans localStorage. Un entraîneur réutilise ses protocoles.
 * ===================================================================== */

const Presets = (() => {
  const LS_KEY = "interval_timer_presets";

  function all() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch { return {}; }
  }

  function names() { return Object.keys(all()).sort(); }

  function save(name, config) {
    if (!name || !name.trim()) throw new Error("Donne un nom au préréglage.");
    const data = all();
    data[name.trim()] = config;
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }

  function load(name) {
    return all()[name] || null;
  }

  function remove(name) {
    const data = all();
    delete data[name];
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }

  return { names, save, load, remove };
})();
