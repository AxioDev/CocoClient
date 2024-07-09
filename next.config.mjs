import path from 'path';
import withPWA from '@ducanh2912/next-pwa';

const nextConfig = {
    reactStrictMode: false,
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: [
                {
                    loader: '@svgr/webpack',
                    options: {
                        icon: true,
                    },
                },
            ],
        });
        return config;
    },
};

const pwaConfig = withPWA({
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggresiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: false,
    workboxOptions: {
        disableDevLogs: true,
    },
});

export default {
    ...nextConfig,
    ...pwaConfig,
};
