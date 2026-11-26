/* Winter is the current default. Summer can be reviewed explicitly; no calendar switch is assumed. */
(()=>{const requested=new URLSearchParams(location.search).get('season');document.documentElement.dataset.season=requested==='summer'?'summer':'winter';})();
