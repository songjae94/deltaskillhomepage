(() => {
const p=new URLSearchParams(location.search);
const teaching=['teacher','academy'].includes(p.get('audience'))||location.pathname.endsWith('/layout-demo.html');
document.documentElement.dataset.surface=teaching?'teaching':'learning';
})();
