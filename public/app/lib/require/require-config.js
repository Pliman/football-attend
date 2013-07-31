var require = {
    baseUrl: '/app',
    paths: {
        jQuery: 'lib/jquery/jquery-1.10.1',
        underscore: '/lib/underscore/underscore',
        bootstrap: '/lib/bootstrap/bootstrap'
    },
    shim: {
        bootstrap: {
            deps: ['jQuery']
        },
        underscore: {
            exports: "_"
        },
        jQuery: {
            exports: "jQuery"
        }
    },
    packages: ['groups', 'projects']
};
