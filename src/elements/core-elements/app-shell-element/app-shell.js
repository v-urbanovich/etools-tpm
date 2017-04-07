Polymer({

    is: 'app-shell',

    behaviors: [
        etoolsBehaviors.LoadingBehavior
    ],

    properties: {

        page: {
            type: String,
            reflectToAttribute: true,
            observer: '_pageChanged'
        },

        narrow: {
            type: Boolean,
            reflectToAttribute: true
        },

        _toast: {
            type: Object,
            value: null
        },

        _toastQueue: {
            type: Array,
            value: function() {
                return [];
            }
        },
        globalLoadingQueue: {
            type: Array,
            value: function() {return [];}
        }
    },

    observers: [
        '_routePageChanged(route)'
    ],

    listeners: {
        'global-loading': '_handleGlobalLoading',
        'toast': 'queueToast',
        'drawer': 'toggleDrawer',
        '404': '_pageNotFound',
        'user-profile-loaded': '_profileLoaded'
    },
    attached: function() {
        this.fire('global-loading', {message: 'Loading...', active: true, type: 'initialisation'});
        if (this.route.path === '/') {
            this.set('route.path', '/partners/list');
        }
    },
    toggleDrawer: function() {
        this.$.drawer.toggle();
    },
    queueToast: function(e, detail) {
        if (!this._toast) {
            this._toast = document.createElement('paper-toast');
            this.listen(this._toast, 'iron-overlay-closed', 'dequeueToast');
            Polymer.dom(this.$.layout).appendChild(this._toast);
            Polymer.dom.flush();
        }
        if (!this._toastQueue.length) {
            this.push('_toastQueue', detail);
            this._toast.show(detail);
        } else {
            this.push('_toastQueue', detail);
        }
    },
    dequeueToast: function() {
        this.shift('_toastQueue');
        if (this._toastQueue.length) {
            this._toast.show(this._toastQueue[0]);
        }
    },
    _routePageChanged: function() {
        if (!this.initLoadingComplete || !this.routeData.page) { return; }
        this.page = this.routeData.page || 'partners';
    },
    _pageChanged: function(page) {
        if (Polymer.isInstance(this.$[`${page}`])) { return; }
        this.fire('global-loading', {message: 'Loading...', active: true, type: 'initialisation'});

        var resolvedPageUrl;
        if (page === 'not-found') {
            resolvedPageUrl = this.resolveUrl('../../pages/not-found-page-view/not-found-page-view.html');
        } else {
            resolvedPageUrl = this.resolveUrl(`/elements/pages/${page}-page-components/${page}-page-main/${page}-page-main.html`);
        }
        this.importHref(resolvedPageUrl, () => {
            if (!this.initLoadingComplete) { this.initLoadingComplete = true; }
            this.fire('global-loading', {type: 'initialisation'});
        }, this._pageNotFound, true);
    },
    _pageNotFound: function(event) {
        this.page = 'not-found';
        let message = event && event.detail && event.detail.message ?
            `${event.detail.message}` :
            'Oops you hit a 404!';

        this.fire('toast', {text: message});
    },
    _profileLoaded: function() {
        if (this.routeData) { this.page = this.routeData.page || 'partners'; }
    },
    _handleGlobalLoading: function(event) {
        if (!event.detail || !event.detail.type) {
            console.error('Bad details object', JSON.stringify(event.detail));
            return;
        }
        let loadingElement =  this.$['global-loading'];

        // console.log(`${event.detail.message}/${event.detail.type}`)
        if (event.detail.active && loadingElement.active) {
            this.globalLoadingQueue.push(event);
        } else if (event.detail.active && typeof event.detail.message === 'string' && event.detail.message !== '') {
            loadingElement.loadingText = event.detail.message;
            loadingElement.active = true;
        } else {
            loadingElement.active = false;
            this.globalLoadingQueue = this.globalLoadingQueue.filter((element) => {return element.detail.type !== event.detail.type;});
            if (this.globalLoadingQueue.length) {
                this._handleGlobalLoading(this.globalLoadingQueue.shift());
            }
        }
    }

});
