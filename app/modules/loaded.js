module.exports = () => {
    var background = document.getElementById('loading-bg');
    if (background) {
        background.style.opacity = '0';
        setTimeout(() => document.body.removeChild(background), 0.2);
    }
    document.getElementById('main').style.opacity = '1';
    document.getElementById('main').style.pointerEvents = 'all';
};
//# sourceMappingURL=loaded.js.map