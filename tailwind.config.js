module.exports = {
    purge: {
        content: [
            './resources/views/**/**.html',
            './resources/js/**/*.js'
        ]
    },
    important: true,
    theme: {
        extend: {},
    },
    variants: {
        extend: {
            borderWidth: ['last'],
            borderRadius: ['last'],
            margin: ['last'],
        }
    },
    plugins: [],
}