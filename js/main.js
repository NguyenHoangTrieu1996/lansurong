const app = document.getElementById('app');

const loaded = {
    pages: {
        index: true,
    },
    datas: {
    }
};

const routes = {
    '/': {
        page: 'index'
    },
    '/bieudien': {
        page: 'bieudien',
    },
    '/chetac': {
        page: 'chetac',
    },
    '/doisong': {
        page: 'doisong',
    },
    '/nguongoc': {
        page: 'nguongoc',
    },
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.defer = true;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
    });
}

function afterRender() {
    const videos = document.querySelectorAll("video");
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (!entry.isIntersecting) {
                    video.pause(); 
                }
            });
        },
        {
            threshold: 0.3 
        }
    );
    videos.forEach(video => observer.observe(video));

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const lang = localStorage.getItem('language');
    if (lang) {
        document.querySelector('#lang-vi, #lang-eng')?.setAttribute('id', lang);
        document.querySelectorAll('.lang').forEach(el => el.style.display = 'none');
        document.querySelectorAll(`.${lang}`).forEach(el => el.style.display = 'block');
        document.querySelectorAll(`.${lang}-inline`).forEach(el => el.style.display = 'inline');
    }
}

async function render() {
    showLoader();
    const path = location.hash.replace('#', '') || '/';
    const route = routes[path];
    if (!route) {
        hideLoader();
        app.innerHTML = `<h2>404 - Trang không tồn tại</h2><a href="#/">← Quay về trang chủ</a>`;
        return;
    }
    try {
        if (!loaded.pages[route.page]) await loadScript(`./pages/${route.page}.js`).then(() => loaded.pages[route.page] = true);
        app.innerHTML = window.Pages[route.page](null);
        if (loaded.pages[route.page] && route.data && loaded.datas[route.data]) {
            app.innerHTML = window.Pages[route.page](window.datas[route.data]);
        }
        if (loaded.pages[route.page] && route.data && !loaded.datas[route.data]) {
            await loadScript(`./public/datas/${route.data}Data.js`).then(() => loaded.datas[route.data] = true);
            app.innerHTML = window.Pages[route.page](window.datas[route.data]);
        }


    } catch (e) {
        alert("Lỗi tải trang, Trang chưa được Load, đợi một ít phút xong quay lại trang");
        app.innerHTML = "<h2>Lỗi tải trang, Trang chưa được Load, đợi một ít phút xong quay lại trang</h2>";
        console.log(e)
        showLoader();
    } finally {
        afterRender();
        hideLoader();
    }
}

function preloadData() {
    setTimeout(() => {
        Object.values(routes).forEach(route => {
            if (route.page && !loaded.pages[route.page]) {
                loadScript(`./pages/${route.page}.js`).then(() => loaded.pages[route.page] = true);
            }
            if (route.data && !loaded.datas[route.data]) {
                loadScript(`./public/datas/${route.data}Data.js`).then(() => loaded.datas[route.data] = true);
            }
        });

    }, 500);
}

window.addEventListener('hashchange', render);
window.addEventListener('load', render);

preloadData();
