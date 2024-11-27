document.addEventListener('DOMContentLoaded', async () => {
    const desktop = document.getElementById('desktop');
    const startMenu = document.getElementById('start-menu-apps');
    const taskbar = document.getElementById('taskbar');
    const taskbarApps = document.getElementById('taskbar-apps');
    let selectedIcon = null; // Przechowuje aktualnie zaznaczoną ikonę

    const response = await fetch('/api/apps');
    const apps = await response.json();

    apps.forEach(app => {
        // Ikona na pulpicie
        const desktopIcon = document.createElement('div');
        desktopIcon.classList.add('desktop-icon');
        desktopIcon.dataset.app = app.key;
        desktopIcon.innerHTML = `
            <img src="${app.icon}" alt="${app.name}">
            <span>${app.name}</span>
        `;
        desktop.appendChild(desktopIcon);

        // Pozycja w menu start
        const startMenuItem = document.createElement('li');
        startMenuItem.classList.add('start-menu-item');
        startMenuItem.dataset.app = app.key;
        startMenuItem.innerHTML = `
            <img src="${app.icon}" alt="${app.name}">
            <span>${app.name}</span>
        `;
        const category = document.querySelector(`[data-category="${app.startMenuCategory}"]`);
        if (category) category.appendChild(startMenuItem);
    });

    // Podświetlanie ikon po kliknięciu
    desktop.addEventListener('click', (event) => {
        const icon = event.target.closest('.desktop-icon');
        if (icon) {
            // Usuń podświetlenie z poprzedniej ikony
            if (selectedIcon) {
                selectedIcon.classList.remove('selected');
            }
            // Podświetl klikniętą ikonę
            selectedIcon = icon;
            selectedIcon.classList.add('selected');
        } else {
            // Kliknięcie poza ikonami - usuń podświetlenie
            if (selectedIcon) {
                selectedIcon.classList.remove('selected');
                selectedIcon = null;
            }
        }
    });

    // Obsługa podwójnego kliknięcia na ikonie
    desktop.addEventListener('dblclick', (event) => {
        const target = event.target.closest('.desktop-icon');
        if (!target) return;

        const appKey = target.dataset.app;
        const app = apps.find(a => a.key === appKey);
        if (app) openAppWindow(app);
        
        if (selectedIcon) {
            selectedIcon.classList.remove('selected');
            selectedIcon = null;
        }
    });

    // Obsługa kliknięcia w menu start
    startMenu.addEventListener('click', (event) => {
        const target = event.target.closest('.start-menu-item');
        if (!target) return;

        const appKey = target.dataset.app;
        const app = apps.find(a => a.key === appKey);
        if (app) openAppWindow(app);
    });

    // Umożliwienie przeciągania ikon
    makeIconsDraggable();

    // Dodanie funkcji dla otwartych aplikacji
    function openAppWindow(app) {
        const existingWindow = document.querySelector(`.window[data-app="${app.key}"]`);
        if (existingWindow) {
            existingWindow.style.display = 'block';
            return;
        }

        const windowElement = document.createElement('div');
        windowElement.classList.add('window');
        windowElement.dataset.app = app.key;

        // Pobierz styl aplikacji, jeśli istnieje
        const appStyle = document.createElement('link');
        appStyle.rel = 'stylesheet';
        appStyle.href = `/apps/${app.key}/public/${app.key}.css`;

        document.head.appendChild(appStyle);

        windowElement.innerHTML = `
            <div class="window-header">
                <span class="window-icon"><img src="/apps/${app.key}/public/icon.png" /></span>
                <span>${app.name}</span>
                <div class="window-controls">
                    <button class="minimize">_</button>
                    <button class="maximize">[]</button>
                    <button class="close">X</button>
                </div>
            </div>
            <div class="window-content">
                <iframe src="${app.url}" frameborder="0" style="width: 100%; height: 100%;"></iframe>
            </div>
        `;

        document.body.appendChild(windowElement);
        addToTaskbar(app);

        makeWindowDraggable(windowElement);
        addWindowControls(windowElement);
    }

    function addWindowControls(windowElement) {
        const minimizeButton = windowElement.querySelector('.minimize');
        const maximizeButton = windowElement.querySelector('.maximize');
        const closeButton = windowElement.querySelector('.close');

        minimizeButton.addEventListener('click', () => {
            windowElement.style.display = 'none';
        });

        maximizeButton.addEventListener('click', () => {
            if (windowElement.classList.contains('maximized')) {
                windowElement.style.top = '100px';
                windowElement.style.left = '100px';
                windowElement.style.width = '800px';
                windowElement.style.height = '600px';
                windowElement.classList.remove('maximized');
            } else {
                windowElement.style.top = '0';
                windowElement.style.left = '0';
                windowElement.style.width = '100vw';
                windowElement.style.height = '100vh';
                windowElement.classList.add('maximized');
            }
        });

        closeButton.addEventListener('click', () => {
            windowElement.remove();
            removeFromTaskbar(windowElement.dataset.app);
        });
    }

    function makeWindowDraggable(windowElement) {
        const header = windowElement.querySelector('.window-header');
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windowElement.offsetLeft;
            offsetY = e.clientY - windowElement.offsetTop;
            windowElement.style.zIndex = '1000';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                windowElement.style.left = `${e.clientX - offsetX}px`;
                windowElement.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    function makeIconsDraggable() {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach((icon) => {
            let isDragging = false;
            let offsetX = 0;
            let offsetY = 0;

            icon.addEventListener('mousedown', (e) => {
                isDragging = true;
                offsetX = e.clientX - icon.offsetLeft;
                offsetY = e.clientY - icon.offsetTop;
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    icon.style.position = 'absolute';
                    icon.style.left = `${e.clientX - offsetX}px`;
                    icon.style.top = `${e.clientY - offsetY}px`;
                }
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        });
    }

    function addToTaskbar(app) {
        const taskbarIcon = document.createElement('div');
        taskbarIcon.classList.add('taskbar-icon');
        taskbarIcon.dataset.app = app.key;
        taskbarIcon.innerHTML = `<img src="${app.icon}" alt="${app.name}">`;
        taskbarApps.appendChild(taskbarIcon);

        taskbarIcon.addEventListener('click', () => {
            const windowElement = document.querySelector(`.window[data-app="${app.key}"]`);
            if (windowElement) {
                windowElement.style.display = windowElement.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    function removeFromTaskbar(appKey) {
        const taskbarIcon = taskbarApps.querySelector(`.taskbar-icon[data-app="${appKey}"]`);
        if (taskbarIcon) taskbarIcon.remove();
    }
});
