import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:45000,use:{browserName:'chromium',baseURL:'http://127.0.0.1:4175',serviceWorkers:'allow'},webServer:{command:'python3 -m http.server 4175 --bind 127.0.0.1',url:'http://127.0.0.1:4175',reuseExistingServer:false,timeout:10000}});
