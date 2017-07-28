'use strict';

Polymer({
    is: 'list-header',
    properties: {
        orderBy: {
            type: String,
            notify: true
        },
        noOrdered: Boolean,
        noAdditional: {
            type: Boolean,
            value: false
        },
        paddingValue: {
            type: Number,
            value: 72
        },
        level: {
            type: Number,
            value: 1
        }
    },
    observers: [
        '_setRightPadding(data.*)',
        '_setLeftPadding(noAdditional, paddingValue, level)'
    ],
    _setLeftPadding: function(noAdditional, paddingValue, level) {
        let padding = 0;
        if (noAdditional) {
            padding = 24;
        } else {
            padding = (paddingValue || 0) * (level || 1);
        }

        this.style.paddingLeft = `${padding}px`;
    },
    _setRightPadding: function() {
        if (!this.data) { return; }
        let rightPadding = 0;
        let padding;

        this.data.forEach((heading) => {
            if (typeof heading.size === 'string') {
                padding = parseInt(heading.size, 10) || 0;
                rightPadding += padding;
            }
        });

        this.paddingRight = `${rightPadding}px`;
    },
    _changeOrder: function(event) {
        if (this.noOrdered) { return; }

        let newOrderName = event && event.model && event.model.item && event.model.item.name;
        let currentOrderName = this.orderBy || '';
        let direction = '-';

        if (currentOrderName.startsWith('-')) {
            direction = '';
            currentOrderName = currentOrderName.slice(1);
        }

        if (newOrderName !== currentOrderName) {
            direction = '';
        }

        this.orderBy = `${direction}${newOrderName}`;
    }
});
