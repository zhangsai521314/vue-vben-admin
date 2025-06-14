// vite.config.mts
import { defineApplicationConfig } from "file:///E:/Work/Code/411812300_%E5%9F%BA%E4%BA%8ELTE-M%E7%9A%84%E8%B0%83%E5%BA%A6%E9%80%9A%E4%BF%A1%E5%8F%8A%E5%88%97%E5%B0%BE%E7%B3%BB%E7%BB%9F/3%E3%80%81%E8%AE%BE%E8%AE%A1%E9%98%B6%E6%AE%B5/%E7%BD%91%E7%AE%A1%E7%B3%BB%E7%BB%9F/Web/ui/internal/vite-config/dist/index.mjs";
var vite_config_default = defineApplicationConfig({
  overrides: {
    optimizeDeps: {
      include: [
        "echarts/core",
        "echarts/charts",
        "echarts/components",
        "echarts/renderers",
        "qrcode",
        "@iconify/iconify",
        "ant-design-vue/es/locale/zh_CN",
        "ant-design-vue/es/locale/en_US"
      ]
    },
    server: {
      port: 3200,
      //本地开发代理，可以解决跨域及多地址代理
      proxy: {
        "/basic-api": {
          target: "http://127.0.0.1:8088",
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/basic-api`), "")
          // only https
          // secure: false
        },
        "/uploads": {
          target: "http://127.0.0.1:8088/uploads",
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/uploads`), "")
        }
      },
      open: true,
      // 项目启动后，自动打开
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"]
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcV29ya1xcXFxDb2RlXFxcXDQxMTgxMjMwMF9cdTU3RkFcdTRFOEVMVEUtTVx1NzY4NFx1OEMwM1x1NUVBNlx1OTAxQVx1NEZFMVx1NTNDQVx1NTIxN1x1NUMzRVx1N0NGQlx1N0VERlxcXFwzXHUzMDAxXHU4QkJFXHU4QkExXHU5NjM2XHU2QkI1XFxcXFx1N0Y1MVx1N0JBMVx1N0NGQlx1N0VERlxcXFxXZWJcXFxcdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXFdvcmtcXFxcQ29kZVxcXFw0MTE4MTIzMDBfXHU1N0ZBXHU0RThFTFRFLU1cdTc2ODRcdThDMDNcdTVFQTZcdTkwMUFcdTRGRTFcdTUzQ0FcdTUyMTdcdTVDM0VcdTdDRkJcdTdFREZcXFxcM1x1MzAwMVx1OEJCRVx1OEJBMVx1OTYzNlx1NkJCNVxcXFxcdTdGNTFcdTdCQTFcdTdDRkJcdTdFREZcXFxcV2ViXFxcXHVpXFxcXHZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovV29yay9Db2RlLzQxMTgxMjMwMF8lRTUlOUYlQkElRTQlQkElOEVMVEUtTSVFNyU5QSU4NCVFOCVCMCU4MyVFNSVCQSVBNiVFOSU4MCU5QSVFNCVCRiVBMSVFNSU4RiU4QSVFNSU4OCU5NyVFNSVCMCVCRSVFNyVCMyVCQiVFNyVCQiU5Ri8zJUUzJTgwJTgxJUU4JUFFJUJFJUU4JUFFJUExJUU5JTk4JUI2JUU2JUFFJUI1LyVFNyVCRCU5MSVFNyVBRSVBMSVFNyVCMyVCQiVFNyVCQiU5Ri9XZWIvdWkvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IHsgZGVmaW5lQXBwbGljYXRpb25Db25maWcgfSBmcm9tICdAdmJlbi92aXRlLWNvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUFwcGxpY2F0aW9uQ29uZmlnKHtcbiAgb3ZlcnJpZGVzOiB7XG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgICdlY2hhcnRzL2NvcmUnLFxuICAgICAgICAnZWNoYXJ0cy9jaGFydHMnLFxuICAgICAgICAnZWNoYXJ0cy9jb21wb25lbnRzJyxcbiAgICAgICAgJ2VjaGFydHMvcmVuZGVyZXJzJyxcbiAgICAgICAgJ3FyY29kZScsXG4gICAgICAgICdAaWNvbmlmeS9pY29uaWZ5JyxcbiAgICAgICAgJ2FudC1kZXNpZ24tdnVlL2VzL2xvY2FsZS96aF9DTicsXG4gICAgICAgICdhbnQtZGVzaWduLXZ1ZS9lcy9sb2NhbGUvZW5fVVMnLFxuICAgICAgXSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMzIwMCxcbiAgICAgIC8vXHU2NzJDXHU1NzMwXHU1RjAwXHU1M0QxXHU0RUUzXHU3NDA2XHVGRjBDXHU1M0VGXHU0RUU1XHU4OUUzXHU1MUIzXHU4REU4XHU1N0RGXHU1M0NBXHU1OTFBXHU1NzMwXHU1NzQwXHU0RUUzXHU3NDA2XG4gICAgICBwcm94eToge1xuICAgICAgICAnL2Jhc2ljLWFwaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjgwODgnLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICB3czogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4vYmFzaWMtYXBpYCksICcnKSxcbiAgICAgICAgICAvLyBvbmx5IGh0dHBzXG4gICAgICAgICAgLy8gc2VjdXJlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAnL3VwbG9hZHMnOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEyNy4wLjAuMTo4MDg4L3VwbG9hZHMnLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICB3czogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4vdXBsb2Fkc2ApLCAnJyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgb3BlbjogdHJ1ZSwgLy8gXHU5ODc5XHU3NkVFXHU1NDJGXHU1MkE4XHU1NDBFXHVGRjBDXHU4MUVBXHU1MkE4XHU2MjUzXHU1RjAwXG4gICAgICB3YXJtdXA6IHtcbiAgICAgICAgY2xpZW50RmlsZXM6IFsnLi9pbmRleC5odG1sJywgJy4vc3JjL3t2aWV3cyxjb21wb25lbnRzfS8qJ10sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNmhCLFNBQVMsK0JBQStCO0FBRXJrQixJQUFPLHNCQUFRLHdCQUF3QjtBQUFBLEVBQ3JDLFdBQVc7QUFBQSxJQUNULGNBQWM7QUFBQSxNQUNaLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUE7QUFBQSxNQUVOLE9BQU87QUFBQSxRQUNMLGNBQWM7QUFBQSxVQUNaLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLElBQUk7QUFBQSxVQUNKLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxJQUFJLE9BQU8sYUFBYSxHQUFHLEVBQUU7QUFBQTtBQUFBO0FBQUEsUUFHL0Q7QUFBQSxRQUNBLFlBQVk7QUFBQSxVQUNWLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLElBQUk7QUFBQSxVQUNKLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxJQUFJLE9BQU8sV0FBVyxHQUFHLEVBQUU7QUFBQSxRQUM3RDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLE1BQU07QUFBQTtBQUFBLE1BQ04sUUFBUTtBQUFBLFFBQ04sYUFBYSxDQUFDLGdCQUFnQiw0QkFBNEI7QUFBQSxNQUM1RDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
